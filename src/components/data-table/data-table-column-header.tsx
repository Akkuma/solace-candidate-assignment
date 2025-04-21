"use client";

import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, EyeNoneIcon } from "@radix-ui/react-icons";
import { type Column, type SortDirection } from "@tanstack/react-table";
import { titleCase } from "moderndash";
import type { ReactElement, ReactNode } from "react";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SimpleAlignment } from "./types";

const ArrowDown = <ArrowDownIcon className="ml-2 h-4 w-4" />;
const ArrowUp = <ArrowUpIcon className="ml-2 h-4 w-4" />;
const CaretSort = <CaretSortIcon className="ml-2 h-4 w-4" />;
const SortIcon = memo(({ direction }: { direction: false | SortDirection }) => {
  let sortIcon = CaretSort;
  if (direction === "desc") {
    sortIcon = ArrowDown;
  } else if (direction === "asc") {
    sortIcon = ArrowUp;
  }

  return sortIcon;
});
SortIcon.displayName = "SortIcon";

const simpleAlignToJusitfyContent = {
  center: "justify-center",
  end: "justify-end",
  start: "justify-start",
} as const satisfies Record<SimpleAlignment, `justify-${SimpleAlignment}`>;
export interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  tooltip?: ReactNode;
  title?: string;
  render?: ({ headerContent }: { headerContent: ReactNode }) => ReactElement;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title: customTitle,
  render,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const metaTitle = customTitle || column.columnDef.meta?.title;
  const metaTooltip = column.columnDef.meta?.tooltip;
  if (!column.accessorFn && !metaTitle) return null;

  const title = metaTitle || titleCase(column.id);
  if (!column.getCanSort()) {
    return (
      <span className="whitespace-nowrap font-medium text-xs flex gap-2">
        {render?.({ headerContent: title }) || title}
        {metaTooltip}
      </span>
    );
  }
  let align = column.columnDef.meta?.align;
  align = typeof align === "object" ? align.header : align;

  const dropdownMenuTrigger = (
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="p-0 h-8 hover:bg-inherit focus-visible:ring-0">
        <span className="flex gap-2">
          {title}
          {metaTooltip}
        </span>
        <SortIcon direction={column.getIsSorted()} />
      </Button>
    </DropdownMenuTrigger>
  );

  return (
    <div className={cn("flex items-center space-x-2", align && simpleAlignToJusitfyContent[align])}>
      <DropdownMenu>
        {render?.({ headerContent: dropdownMenuTrigger }) || dropdownMenuTrigger}
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => {
              column.toggleSorting(false);
            }}
          >
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              column.toggleSorting(true);
            }}
          >
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          {column.getCanHide() ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  column.toggleVisibility(false);
                }}
              >
                <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Hide
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
