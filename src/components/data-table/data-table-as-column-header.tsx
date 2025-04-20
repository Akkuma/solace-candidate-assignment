import { DataTableColumnHeader, type DataTableColumnHeaderProps } from "./data-table-column-header.jsx";

export const asColumnHeader = <TData, TValue>({
  column,
}: Pick<DataTableColumnHeaderProps<TData, TValue>, "column">) => <DataTableColumnHeader column={column} />;
