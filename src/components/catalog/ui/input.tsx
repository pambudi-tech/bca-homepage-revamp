// Adapted from shadcn/ui new-york registry (MIT). Documentation-only tokens.
import * as React from "react"

import { cn } from "@/components/catalog/ui/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-neutral-400 bg-transparent px-3 py-1 text-size-body-l shadow-sm transition-colors file:border-0 file:bg-transparent file:text-size-body-m file:font-medium file:text-neutral-900 placeholder:text-neutral-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 md:text-size-body-m",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
