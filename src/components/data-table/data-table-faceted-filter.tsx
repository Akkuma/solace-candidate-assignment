"use client";

import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { type Column } from "@tanstack/react-table";
import { titleCase } from "moderndash";
import * as React from "react";
import type { Primitive } from "type-fest";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/app/components/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { memo, useMemo } from "react";

interface DataTableFacetedFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  title?: string;
  options?: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

// Create stable references
const unopenedOptions = [] as const;
const unopenedFacets = new Map();

// If we memoize at this level we have to internally maintain the selected values.
// This would also run into issues with the global filter reset requiring more work.
export function DataTableFacetedFilter<TData, TValue>({
  column,
  title = column.columnDef.meta?.title || titleCase(column.id),
  options: customOptions,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const filterValues = column.getFilterValue() as unknown[] | undefined;
  const selectedValues = useMemo(() => new Set(filterValues || []), [filterValues]);
  const facets = column.getFacetedUniqueValues();
  const options = customOptions || isOpen ? defaultOptions(facets) : unopenedOptions;

  const sortedOptions = useMemo(() => {
    return options.toSorted((a, b) => {
      if (selectedValues.has(a.value) && !selectedValues.has(b.value)) return -1;
      if (!selectedValues.has(a.value) && selectedValues.has(b.value)) return 1;
      if (typeof a.value === "number" && typeof b.value === "number") return a.value > b.value ? 1 : -1;
      return a.value?.toString().localeCompare(b.value?.toString() ?? "") ?? 0;
    });
    // We specifically want the ordering to remain static until we reopen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, isOpen]);

  return (
    <MemoizedFilter
      setIsOpen={setIsOpen}
      column={column}
      title={title}
      options={sortedOptions}
      selectedValues={selectedValues}
      facets={facets}
    />
  );
}

interface MemoizedFilter {
  column: Column<any>;
  setIsOpen: (open: boolean) => unknown;
  title: string;
  selectedValues: Set<unknown>;
  options: {
    label: string;
    value: Primitive;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  facets: Map<unknown, number>;
}
const MemoizedFilter = memo(function MemoizedFilter({
  setIsOpen,
  title,
  selectedValues,
  options,
  column,
  facets,
}: MemoizedFilter) {
  console.log("Filter rend");
  return (
    <Popover onOpenChange={setIsOpen}>
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
                  options
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
              {options.map((opt) => {
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
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facets.get(value)}
                      </span>
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

const optsCache = new Map<string, { label: string; value: Primitive; icon: undefined }[]>();
const defaultOptions = (facets: Map<string, number>) => {
  const keys = [...facets.keys()];
  if (keys.length === 0) return [];

  const key = keys.reduce((acc, key) => `${acc},${key}`);
  const opts = optsCache.get(key);

  if (opts) {
    return opts;
  }

  const defaultOpts = keys.map((key) => {
    return {
      label: key, //capitalize((key as Primitive)?.toString() || ''),
      value: key as Primitive,
      icon: undefined,
    };
  });

  optsCache.set(key, defaultOpts);
  return defaultOpts;
};
