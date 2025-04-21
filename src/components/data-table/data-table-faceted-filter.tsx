import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { type Column } from "@tanstack/react-table";
import { titleCase } from "moderndash";
import * as React from "react";
import type { Primitive } from "type-fest";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { memo, useMemo, useState } from "react";

interface DataTableFacetedFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  title?: string;
  options?: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  filterValues: unknown[] | undefined;
}

export const DataTableFacetedFilter = memo(function DataTableFacetedFilter<TData, TValue>({
  column,
  title = column.columnDef.meta?.title || titleCase(column.id),
  options: customOptions,
  filterValues = [],
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValues = useMemo(() => new Set(filterValues), [filterValues]);
  const facets = column.getFacetedUniqueValues();
  const options = customOptions || defaultOptions(column.getFacetedUniqueValues());
  const [sortedOptions, setSortedOptions] = useState(() => sortOptions(options, selectedValues));

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) return;

        // Initial options are [] while loading so we need to use the current faceted unique values
        setSortedOptions(
          sortOptions(customOptions || defaultOptions(column.getFacetedUniqueValues()), selectedValues),
        );
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  sortedOptions
                    .filter((option) => selectedValues.has(option.value))
                    .map(({ label, value }) => (
                      <Badge
                        variant="secondary"
                        key={value?.toString() || label}
                        className="rounded-sm px-1 font-normal"
                      >
                        {label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {sortedOptions.map((opt) => {
                const { label, value } = opt;
                const isSelected = selectedValues.has(value);
                return (
                  <CommandItem
                    key={value?.toString() || label}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(value);
                      } else {
                        selectedValues.add(value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column.setFilterValue(filterValues.length ? filterValues : undefined);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    {opt.icon && <opt.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{label}</span>
                    {facets.get(value) && (
                      <span className="ml-auto font-mono text-xs">{facets.get(value)}</span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {selectedValues.size > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    column.setFilterValue(undefined);
                    selectedValues.clear();
                    setSortedOptions(sortOptions(sortedOptions, selectedValues));
                  }}
                  className="justify-center text-center"
                >
                  Clear filters
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
});

const defaultOptions = (facets: Map<unknown, number>) => {
  return [...facets.entries()].map(([key]) => {
    return {
      label: (key as Primitive)?.toString() || "",
      value: key as Primitive,
      icon: undefined,
    };
  });
};

const sortOptions = (
  opts:
    | NonNullable<DataTableFacetedFilterProps<unknown, unknown>["options"]>
    | ReturnType<typeof defaultOptions>,
  selectedValues: Set<unknown>,
) => {
  return opts.toSorted((a, b) => {
    if (selectedValues.has(a.value) && !selectedValues.has(b.value)) return -1;
    if (!selectedValues.has(a.value) && selectedValues.has(b.value)) return 1;
    if (typeof a.value === "number" && typeof b.value === "number") return a.value - b.value;
    if (typeof a.value === "string" && typeof b.value === "string") return a.value.localeCompare(b.value);
    return 0;
  });
};
