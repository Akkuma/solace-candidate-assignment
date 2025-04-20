import { type FilterFn, filterFns } from "@tanstack/react-table";

type FilterTypeOf = "string" | "number" | "boolean";
interface FlexibleFilterFn {
  (againstArray: boolean): FilterFn<unknown>;
}
const autoFilterMapByTypeOfCellValue: Record<FilterTypeOf | "array", FlexibleFilterFn> = {
  string: (againstArray) => (againstArray ? filterFns.arrIncludesSome : filterFns.includesString),
  number: (againstArray) => (againstArray ? hasSomeNumber : filterFns.inNumberRange),
  boolean: (againstArray) => (againstArray ? hasSomeBoolean : filterFns.equals),
  array: (againstArray) => (againstArray ? filterFns.arrIncludesSome : filterFns.arrIncludes),
};

const hasSomeNumber: FilterFn<unknown> = (row, columnId, filterValue: unknown[]) => {
  // Filter out all values from the filter that cannot be mapped to a number
  const nums = filterValue.flatMap((val) => {
    let parsed: number | undefined = undefined;
    if (typeof val === "string") parsed = parseFloat(val);
    else if (typeof val === "number") parsed = val;

    return Number.isFinite(parsed) ? parsed : [];
  });

  const val: number = row.getValue(columnId);
  return nums.some((num) => val === num);
};

const hasSomeBoolean: FilterFn<unknown> = (row, columnId, filterValue: unknown[]) => {
  // Filter out all values that aren't explicitly true or false
  const bools = filterValue.flatMap((val) => (val === true || val === false ? val : []));

  const val: boolean = row.getValue(columnId);
  return bools.some((bool) => bool === val);
};

//! Inspired by https://github.com/TanStack/table/blob/f4356c0934017c9cc8948b36629c949e446a94ad/packages/table-core/src/features/Filters.ts#L406-L432
//! We support boolean, number, string, arrays
const enhancedAutoFilter: FilterFn<unknown> = (row, columnId, filterValue, addMeta) => {
  const value = row.getValue(columnId);

  const filter = autoFilterMapByTypeOfCellValue[
    Array.isArray(value) ? "array" : (typeof value as FilterTypeOf)
  ] as FlexibleFilterFn | undefined;
  const fn = filter ? filter(Array.isArray(filterValue)) : filterFns.weakEquals;
  return fn(row, columnId, filterValue, addMeta);
};

export const enhancedFilterFns = {
  ...filterFns,
  enhancedAuto: enhancedAutoFilter,
};
