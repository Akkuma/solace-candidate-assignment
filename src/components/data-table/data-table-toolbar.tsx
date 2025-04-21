"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { debounce, titleCase } from "moderndash";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Search } from "lucide-react";
import { useMemo } from "react";
import { useDataTable } from "./data-table-context";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

interface Slots {
  FiltersContainer: typeof FiltersContainer;
  InputFilter: typeof InputFilter;
  FacetedFilters: typeof FacetedFilters;
  ResetFilters: typeof ResetFilters;
  View: typeof DataTableViewOptions;
}
export interface DataTableToolbarProps {
  searchPlaceholder?: string;
  children?: (slots: Slots) => React.ReactNode;
}

export function DataTableToolbar({ searchPlaceholder, children }: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      {children ? (
        children({ FiltersContainer, InputFilter, FacetedFilters, ResetFilters, View: DataTableViewOptions })
      ) : (
        <>
          <FiltersContainer>
            <InputFilter placeholder={searchPlaceholder} />
            <FacetedFilters />
            <ResetFilters />
          </FiltersContainer>
          <DataTableViewOptions />
        </>
      )}
    </div>
  );
}

const FiltersContainer = ({ children }: React.PropsWithChildren) => {
  return <div className="flex flex-1 items-center gap-2">{children}</div>;
};

const InputFilter = ({ placeholder }: { placeholder?: string }) => {
  const table = useDataTable();

  const input = useMemo(() => {
    let inputPlaceholder = placeholder;
    if (!placeholder) {
      const titles = table
        .getAllColumns()
        .flatMap((column) => column.columnDef.meta?.title || titleCase(column.id));

      if (titles.length > 1) {
        titles[titles.length - 1] = `or ${titles.at(-1)}`;
      }

      inputPlaceholder = `Filter by ${titles.join(", ")}`;
    }
    return (
      <div className="w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4" />
          <Input
            placeholder={inputPlaceholder}
            onChange={debounce((event) => {
              table.setGlobalFilter(event.target.value);
            }, 200)}
            className="pl-8 h-8"
          />
        </div>
      </div>
    );
  }, [table]);
  return input;
};

const FacetedFilters = () => {
  const table = useDataTable();

  return table.getAllColumns().flatMap((column) => {
    const { meta } = column.columnDef;
    if (!meta) return [];

    return meta.enableFacets ? (
      <DataTableFacetedFilter
        key={column.id}
        column={column}
        options={meta.facets}
        filterValues={column.getFilterValue() as unknown[]}
      />
    ) : (
      []
    );
  });
};

const ResetFilters = () => {
  const table = useDataTable();
  const isFiltered = table.getState().columnFilters.length > 0;

  const reset = useMemo(
    () =>
      isFiltered ? (
        <Button
          variant="ghost"
          onClick={() => {
            table.resetColumnFilters(true);
          }}
          className="h-8 px-2 lg:px-3"
        >
          Reset
          <Cross2Icon className="ml-2 h-4 w-4" />
        </Button>
      ) : null,
    [table, isFiltered],
  );
  return reset;
};
