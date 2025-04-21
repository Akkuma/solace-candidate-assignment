"use client";

import { useEffect, useState } from "react";

import { experimental_streamedQuery as streamedQuery, useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";

import { parsePhoneNumber } from "libphonenumber-js/min";

import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";

import type { advocates } from "@/db/schema.js";
import { fetchStream } from "@/lib/fetch-stream";

const queryFn = process.env.NEXT_PUBLIC_USE_STREAMING
  ? streamedQuery({ queryFn: () => fetchStream("/api/advocates") })
  : async () => {
      const response = await fetch("/api/advocates");

      return (await response.json()).data;
    };

type Advocate = typeof advocates.$inferSelect;
export function AdvocatesTable() {
  const { data, isPending } = useQuery<Advocate[]>({
    queryFn,
    queryKey: ["advocates"],
    initialData: [],
  });

  //! Weird bug in tanstack table that I haven't experienced in a pure SPA before
  //! https://github.com/TanStack/table/issues/5026p
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted ? (
    <>
      <DataTable
        columns={columns}
        data={data || []}
        loading={isPending}
        searchPlaceholder="Filter by any column, just start typing."
      />
    </>
  ) : null;
}

const helper = createColumnHelper<Advocate>();
const columns = [
  helper.accessor("firstName", { meta: { width: "w-[115px]" } }),
  helper.accessor("lastName", { meta: { width: "w-[115px]" } }),
  helper.accessor("city", { meta: { width: "w-[200px]", enableFacets: true } }),
  helper.accessor("degree", { meta: { width: "w-[90px]", enableFacets: true } }),
  helper.accessor("specialties", {
    meta: { width: "min-w-full max-w-[800px]", enableFacets: true },
    cell({ cell }) {
      return (
        <div className="flex gap-1">
          {cell.getValue().map((val) => (
            <Badge key={val}>{val}</Badge>
          ))}
        </div>
      );
    },
  }),
  helper.accessor(
    (row) => {
      if (typeof row.yearsOfExperience === "number") return row.yearsOfExperience;
      else parseInt(row.yearsOfExperience, 10);
    },
    {
      id: "yearsOfExperience",
      meta: { align: "end", width: "w-[175px]", enableFacets: true },
    },
  ),
  helper.accessor((row) => parsePhoneNumber(row.phoneNumber).formatNational(), {
    id: "phoneNumber",
    cell: ({ cell }) => <span className="tabular-nums">{cell.getValue()}</span>,
    meta: { align: "end", width: "w-[150px]" },
  }),
];
