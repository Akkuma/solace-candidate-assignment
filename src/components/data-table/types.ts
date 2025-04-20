import type { ComponentType, ReactNode } from "react";
import type { ConditionalKeys } from "type-fest";
import type { Skeleton } from "#/shad/components/skeleton.tsx";
import type { AnyWidth } from "#/tailwind-types.ts";

export type PossibleRowIds<T> = Exclude<ConditionalKeys<T, string | number>, undefined>;
export type PossibleSubRowKeys<T> = Exclude<ConditionalKeys<T, T[] | undefined>, undefined>;

export type SimpleAlignment = "start" | "center" | "end";
export interface CustomColumnMeta {
  title?: string;
  tooltip?: ReactNode;
  enableFacets?: boolean;
  facets?: {
    label: string;
    value: string;
    icon?: ComponentType<{ className?: string }>;
  }[];
  width?: AnyWidth | AnyWidth[];
  align?: SimpleAlignment | { header?: SimpleAlignment; cell?: SimpleAlignment };
  skeletonProps?: Parameters<typeof Skeleton>[0];
}

export interface CustomTableMeta {
  pageSizes?: number[];
}
