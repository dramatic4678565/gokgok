import clsx from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

/**
 * Merges conditional class names, letting later Tailwind utilities win over
 * earlier ones so a caller-supplied `className` always overrides a component
 * default (e.g. `size-4` beating the global 18px `.lucide` rule).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
