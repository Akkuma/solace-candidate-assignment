import type { CustomColumnMeta, CustomTableMeta } from "#/components/data-table/types.ts";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> extends CustomColumnMeta {}
  interface TableMeta<TData extends RowData> extends CustomTableMeta {}
}
