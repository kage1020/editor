"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const tiptapBadgeVariants = cva(
  "text-[0.625rem] font-bold [font-feature:'salt'_on,'cv01'_on] leading-[1.15] flex items-center justify-center border border-solid rounded-sm transition-all duration-200 ease-in-out [&_.tiptap-badge-text]:px-0.5 [&_.tiptap-badge-text]:flex-grow [&_.tiptap-badge-text]:text-left [&_.tiptap-badge-icon]:pointer-events-none [&_.tiptap-badge-icon]:shrink-0 [&_.tiptap-badge-icon]:w-2.5 [&_.tiptap-badge-icon]:h-2.5",
  {
    variants: {
      size: {
        default: "h-5 min-w-5 p-1",
        large:
          "text-xs h-6 min-w-6 p-1.5 rounded-md [&_.tiptap-badge-icon]:w-3 [&_.tiptap-badge-icon]:h-3",
        small: "h-4 min-w-4 p-0.5 rounded-xs",
      },
      trimText: {
        true: "[&_.tiptap-badge-text]:text-ellipsis [&_.tiptap-badge-text]:overflow-hidden",
        false: "",
      },
      appearance: {
        default:
          "bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500 [&_.tiptap-badge-icon]:text-neutral-500 dark:[&_.tiptap-badge-icon]:text-neutral-500",
        subdued:
          "bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 [&_.tiptap-badge-icon]:text-neutral-400 dark:[&_.tiptap-badge-icon]:text-neutral-600",
        emphasized:
          "bg-white dark:bg-black border-neutral-600 dark:border-neutral-500 text-neutral-600 dark:text-neutral-400 [&_.tiptap-badge-icon]:text-neutral-600 dark:[&_.tiptap-badge-icon]:text-neutral-400",
      },
    },
    defaultVariants: {
      size: "default",
      trimText: false,
      appearance: "default",
    },
  },
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tiptapBadgeVariants> {
  variant?: "ghost" | "white" | "gray" | "green" | "default"
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      variant,
      size = "default",
      appearance = "default",
      trimText = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "tiptap-badge",
          tiptapBadgeVariants({ size, trimText, appearance }),
          className,
        )}
        data-style={variant}
        data-size={size}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Badge.displayName = "Badge"

export const BadgeGroup = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, children, orientation = "horizontal", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "tiptap-badge-group",
        "items-center flex flex-wrap gap-1",
        orientation === "vertical" ? "flex-col" : "flex-row",
        className,
      )}
      data-orientation={orientation}
      {...props}
    >
      {children}
    </div>
  )
})
BadgeGroup.displayName = "BadgeGroup"
