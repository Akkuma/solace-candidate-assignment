"use client";

import {
  type Cell,
  type Column,
  type ColumnDef,
  type Header,
  type InitialTableState,
  type PaginationState,
  type Row,
  type TableOptions,
  type Updater,
  flexRender,
} from "@tanstack/react-table";
import type { ComponentProps, JSXElementConstructor, PropsWithChildren } from "react";
import type { ConditionalKeys } from "type-fest";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { DataTableContext, useDataTable } from "./data-table-context";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import type { enhancedFilterFns } from "./filters";
import type { CustomColumnMeta } from "./types";
import { useTable } from "./use-table";

export type { ColumnDef, Column } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line no-unused-vars
  interface ColumnMeta<TData, TValue> extends CustomColumnMeta {}
  type EnhancedFilterFns = typeof enhancedFilterFns;
  interface FilterFns extends EnhancedFilterFns {}
}

const simpleAlignToTextAlign = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
} as const;
type PossibleRowIds<T> = Exclude<ConditionalKeys<T, string | number>, undefined>;
type PossibleSubRowKeys<T> = Exclude<ConditionalKeys<T, T[] | undefined>, undefined>;
export interface DataTableProps<TData> {
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
  searchPlaceholder?: string;
  loading?: boolean;
  skeletonRowCount?: number;
  enableSubRowSelection?: boolean;
  tableOpts?: TableOptions<TData>;
}

export function DataTable<const TData>(props: DataTableProps<TData>) {
  const { onRowClick, searchPlaceholder, loading = false, skeletonRowCount } = props;

  return (
    <DataTableRoot {...props}>
      <DataTableToolbar searchPlaceholder={searchPlaceholder} />
      <DataTableContent>
        <Table>
          <TableHeader>
            <DataTableHeads />
          </TableHeader>
          <TableBody>
            {loading ? (
              <DataTableSkeletonRows rowCount={skeletonRowCount} />
            ) : (
              <DataTableRows onClick={onRowClick} />
            )}
          </TableBody>
        </Table>
      </DataTableContent>
      <DataTablePagination includeSelectedCount />
    </DataTableRoot>
  );
}

export interface DataTableRootProps<TData> {
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
  tableOpts?: TableOptions<TData>;
}
export function DataTableRoot<const TData>({
  children,
  ...props
}: PropsWithChildren<DataTableRootProps<TData>>) {
  const { table } = useTable(props);

  return (
    <DataTableContext.Provider value={{ table }}>
      <div className="flex flex-col gap-4">{children}</div>
    </DataTableContext.Provider>
  );
}

export function DataTableContent({ children }: PropsWithChildren) {
  return <div className="rounded-md border bg-background">{children}</div>;
}

export function DataTableHeads() {
  const table = useDataTable();
  return table.getHeaderGroups().map((headerGroup) => (
    <TableRow key={headerGroup.id}>
      {headerGroup.headers.map((header) => (
        <DataTableHead key={header.id} header={header} />
      ))}
    </TableRow>
  ));
}

export function DataTableHead({ header }: { header: Header<any, unknown> }) {
  const { meta } = header.column.columnDef;
  const align = typeof meta?.align === "object" ? meta.align.header : meta?.align;

  return (
    <TableHead
      key={header.id}
      className={`${meta?.width ?? ""} ${align ? simpleAlignToTextAlign[align] : ""}`}
    >
      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
    </TableHead>
  );
}

export interface DataTableSkeletonCellProps<TData> extends ComponentProps<typeof TableCell> {
  column: Column<TData>;
}
export interface DataTableSkeletonRowsProps {
  rowCount?: number;
}
export function DataTableSkeletonRows<TData>({ rowCount }: DataTableSkeletonRowsProps) {
  const table = useDataTable<TData>();

  return Array.from({ length: rowCount ?? table.getState().pagination.pageSize }).map((_, i) => (
    <TableRow key={i}>
      {table.getVisibleFlatColumns().map((column, i) => {
        const { meta } = column.columnDef;
        const align = typeof meta?.align === "object" ? meta.align.cell : meta?.align;
        return (
          <TableCell key={i} className={`${align ? simpleAlignToTextAlign[align] : ""}`}>
            <Skeleton className="w-full h-6" {...meta?.skeletonProps} />
          </TableCell>
        );
      })}
    </TableRow>
  ));
}

type CProps<T extends JSXElementConstructor<any> | keyof JSX.IntrinsicElements> = Omit<
  ComponentProps<T>,
  "$$typeof"
>;
export interface DataTableRowProps<TData = unknown> extends CProps<typeof TableRow> {
  row: Row<TData>;
}

export interface DataTableCellProps<TData = unknown, TValue = unknown> extends CProps<typeof TableCell> {
  cell: Cell<TData, TValue>;
}
export interface DataTableRowsProps<TData = unknown> {
  onClick?: (r: Row<TData>, e: React.MouseEvent<HTMLTableRowElement>) => void;
  NoResults?: typeof DataTableNoResults;
  Row?: (props: DataTableRowProps<TData>) => React.ReactNode;
  Cell?: (props: DataTableCellProps<TData>) => React.ReactNode;
}
export function DataTableRows<TData>({ onClick, NoResults = DataTableNoResults }: DataTableRowsProps<TData>) {
  const table = useDataTable<TData>();
  const rows = table.getRowModel().rows;

  return rows.length ? (
    rows.map((row) => (
      // We use the spread on row & cell to prevent passing it down to the default TableCell/TableRow
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        onClick={(e) => {
          onClick?.(row, e);
        }}
      >
        {row.getVisibleCells().map((cell) => {
          const { meta } = cell.column.columnDef;
          const align = typeof meta?.align === "object" ? meta.align.cell : meta?.align;
          return (
            <TableCell key={cell.id} className={`${align ? simpleAlignToTextAlign[align] : ""}`}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
      </TableRow>
    ))
  ) : (
    <TableRow>
      <NoResults />
    </TableRow>
  );
}

export function DataTableNoResults() {
  const table = useDataTable();

  return (
    <TableCell colSpan={table.getAllFlatColumns().length} className="h-24 text-center">
      No results.
    </TableCell>
  );
}
