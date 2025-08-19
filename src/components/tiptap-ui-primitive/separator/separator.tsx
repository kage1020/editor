"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

export type Orientation = "horizontal" | "vertical"

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation
  decorative?: boolean
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ decorative, orientation = "vertical", className, ...divProps }, ref) => {
    const ariaOrientation = orientation === "vertical" ? orientation : undefined
    const semanticProps = decorative
      ? { role: "none" }
      : { "aria-orientation": ariaOrientation, role: "separator" }

    return (
      <div
        className={cn(
          "tiptap-separator",
          "shrink-0 bg-neutral-200 dark:bg-neutral-800",
          orientation === "horizontal" ? "h-px w-full my-2" : "h-6 w-px",
          className
        )}
        data-orientation={orientation}
        {...semanticProps}
        {...divProps}
        ref={ref}
      />
    )
  },
)

Separator.displayName = "Separator"
