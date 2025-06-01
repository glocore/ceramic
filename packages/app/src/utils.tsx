import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * merge conflicting tailwind classnames
 * and toggle classnames programmatically.
 *
 * @see {@link [clsx](https://www.npmjs.com/package/clsx)}
 * @see {@link [tailwind-merge](https://www.npmjs.com/package/tailwind-merge)}
 * @see {@link [shadcn/ui `cn` helper](https://ui.shadcn.com/docs/installation/manual#add-a-cn-helper)}
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
