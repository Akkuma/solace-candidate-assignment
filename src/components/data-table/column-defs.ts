import type { DisplayColumnDef } from "@tanstack/react-table";
import { DataTableSelectAll, DataTableSelectRow } from "./data-table-row-select.jsx";

export const selectColumnDef = {
  id: "id",
  header: DataTableSelectAll,
  cell: DataTableSelectRow,
  meta: {
    width: ["w-0"],
  },
} satisfies DisplayColumnDef<unknown>;
