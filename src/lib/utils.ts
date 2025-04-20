import { type ClassValue, clsx } from "clsx";
import {
  type ForwardRefRenderFunction,
  type PropsWithoutRef,
  type ReactNode,
  type RefAttributes,
  forwardRef,
} from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 *
 * @link [Sourced from Total Typescript (Matt Pocock)](https://www.totaltypescript.com/forwardref-with-generic-components)
 */
export function fixedForwardRef<T, P = {}>(
  render: ForwardRefRenderFunction<T, PropsWithoutRef<P>>,
): (props: P & RefAttributes<T>) => ReactNode {
  return forwardRef(render) as (props: P & RefAttributes<T>) => ReactNode;
}
