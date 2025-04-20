"use client";

import {
  type ColumnDef,
  type InitialTableState,
  type PaginationState,
  type Row,
  type SortingState,
  type Table,
  type TableOptions,
  type Updater,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import type { ConditionalKeys, Primitive } from "type-fest";
import { DataTableColumnHeader } from "./data-table-column-header";
import { enhancedFilterFns } from "./filters";
import { getFacetedUniqueValues } from "./get-faceted-unique-values";

type PossibleRowIds<T> = Exclude<ConditionalKeys<T, string | number>, undefined>;
type PossibleSubRowKeys<T> = Exclude<ConditionalKeys<T, T[] | undefined>, undefined>;

export declare namespace useTable {
  export interface Props<TData>
    extends Omit<
      TableOptions<TData>,
      "columns" | "data" | "onRowSelectionChange" | "getCoreRowModel" | "filterFns"
    > {
    /**
     * Property that uniquely identifies a row that is stringifiable
     * @default 'id'
     */
    rowId?: PossibleRowIds<TData>;
    /**
     * Property used for rendering sub rows (expand/collapse)
     * @default 'subRows'
     */
    subRowKey?: PossibleSubRowKeys<TData>;
    columns: readonly ColumnDef<TData, any>[];
    data: readonly TData[];
    initialState?: InitialTableState | undefined;
    onRowSelectionChange?: (rows: Row<TData>[]) => unknown;
    onRowClick?: (row: Row<TData>, e: React.MouseEvent<HTMLTableRowElement>) => unknown;
    onPaginationChange?: (value: Updater<PaginationState>) => void;
    rowCount?: number;
    enableSubRowSelection?: boolean;
    filterFns?: TableOptions<TData>["filterFns"];
    getCoreRowModel?: TableOptions<TData>["getCoreRowModel"];
  }
}

export type UseTableProps<TData> = useTable.Props<TData>;

const defaultColumn = {
  header: DataTableColumnHeader,
  enableColumnFilter: true,
  enableGlobalFilter: true,
  filterFn: "enhancedAuto",
} satisfies Partial<ColumnDef<any>>;

export function useTable<const TData>({
  rowId = "id" as PossibleRowIds<TData>,
  subRowKey = "subRows" as PossibleSubRowKeys<TData>,
  columns,
  data,
  initialState,
  onRowSelectionChange,
  onPaginationChange,
  rowCount,
  enableSubRowSelection = true,
  ...tableOpts
}: useTable.Props<TData>) {
  const [rowSelection, setRowSelection] = useState(initialState?.rowSelection || {});
  const [sorting, setSorting] = useState<SortingState>(initialState?.sorting || []);

  const table: Table<TData> = useReactTable({
    data: data as TData[], // Accepts readonly and force it here for tanstack
    columns: columns as ColumnDef<TData, any>[], // Accepts readonly and force it here for tanstack
    defaultColumn,
    initialState,
    state: {
      sorting,
      rowSelection,
    },
    enableGlobalFilter: true,
    enableRowSelection: true,
    paginateExpandedRows: false,
    filterFns: enhancedFilterFns,
    enableSubRowSelection,
    rowCount,
    //! onPaginationChange set to undefined breaks pagination https://github.com/TanStack/table/issues/5690
    ...(onPaginationChange
      ? {
          manualPagination: true,
          onPaginationChange: (updater: Updater<PaginationState>): void => {
            const newPagination =
              typeof updater === "function" ? updater(table.getState().pagination) : updater;
            table.options.state.pagination = newPagination;
            onPaginationChange(newPagination);
            table.setState((old) => ({ ...old, pagination: newPagination }));
          },
        }
      : undefined),
    onRowSelectionChange: (updater) => {
      const newRowSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newRowSelection);

      if (onRowSelectionChange) {
        const rowsById = table.getFilteredRowModel().rowsById;
        onRowSelectionChange(Object.keys(newRowSelection).map((id) => rowsById[id]));
      }
    },
    onSortingChange: setSorting,
    //! Based on https://github.com/TanStack/table/blob/f4356c0934017c9cc8948b36629c949e446a94ad/packages/table-core/src/features/Filters.ts#L391-L398
    //! This implementation adds support for boolean and arrays as our enhanced filters support more too
    getColumnCanGlobalFilter: (column) => {
      const value = table.getCoreRowModel().flatRows[0]?._getAllCellsByColumnId()[column.id]?.getValue();
      const type = typeof value;

      return type === "string" || type === "number" || type === "boolean" || Array.isArray(value);
    },
    // We verified that subRowKey is
    getSubRows: (row) => row[subRowKey] as TData[] | undefined,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row) => `${row[rowId] as Exclude<Primitive, symbol>}`,
    ...tableOpts,
  });

  return { table };
}
