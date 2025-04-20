import type { RowData, Table } from "@tanstack/react-table";
import { getMemoOptions, memo } from "@tanstack/react-table";

export function getFacetedUniqueValues<TData extends RowData>(): (
  table: Table<TData>,
  columnId: string,
) => () => Map<any, number> {
  return (table, columnId) =>
    memo(
      () => [table.getColumn(columnId)?.getFacetedRowModel()],
      (facetedRowModel) => {
        if (!facetedRowModel) return new Map();

        const facetedUniqueValues = new Map<any, number>();

        for (const flatRow of facetedRowModel.flatRows) {
          const values = flatRow.getUniqueValues<number>(columnId);

          for (const value of values) {
            if (Array.isArray(value)) {
              for (const val of value) {
                setFacetedMap(facetedUniqueValues, val);
              }
            } else {
              setFacetedMap(facetedUniqueValues, value);
            }
          }
        }

        return facetedUniqueValues;
      },
      getMemoOptions(table.options, "debugTable", `getFacetedUniqueValues_${columnId}`),
    );
}

function setFacetedMap(facetedUniqueValues: Map<unknown, number>, value: unknown) {
  if (facetedUniqueValues.has(value)) {
    facetedUniqueValues.set(value, (facetedUniqueValues.get(value) ?? 0) + 1);
  } else {
    facetedUniqueValues.set(value, 1);
  }
}
