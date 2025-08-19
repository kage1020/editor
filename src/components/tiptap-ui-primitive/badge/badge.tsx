"use client"

import { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tiptapBadgeVariants = cva(
  "text-[0.625rem] font-bold [font-feature:'salt'_on,'cv01'_on] leading-[1.15] flex items-center justify-center border border-solid rounded-sm transition-all duration-200 ease-[cubic-bezier(0.46,0.03,0.52,0.96)] bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500 [&>.tiptap-badge-icon]:text-neutral-500 dark:[&>.tiptap-badge-icon]:text-neutral-500 data-[appearance=emphasized]:bg-white dark:data-[appearance=emphasized]:bg-black data-[appearance=emphasized]:border-neutral-600 dark:data-[appearance=emphasized]:border-neutral-500 data-[appearance=emphasized]:text-neutral-600 dark:data-[appearance=emphasized]:text-neutral-400 data-[appearance=emphasized]:[&>.tiptap-badge-icon]:text-violet-600 dark:data-[appearance=emphasized]:[&>.tiptap-badge-icon]:text-violet-400 data-[appearance=subdued]:bg-white dark:data-[appearance=subdued]:bg-black data-[appearance=subdued]:border-neutral-200 dark:data-[appearance=subdued]:border-neutral-800 data-[appearance=subdued]:text-neutral-400 dark:data-[appearance=subdued]:text-neutral-600 data-[appearance=subdued]:[&>.tiptap-badge-icon]:text-neutral-400 dark:data-[appearance=subdued]:[&>.tiptap-badge-icon]:text-neutral-600 [&>.tiptap-badge-text]:px-0.5 [&>.tiptap-badge-text]:flex-grow [&>.tiptap-badge-text]:text-left data-[text-trim=on]:[&>.tiptap-badge-text]:text-ellipsis data-[text-trim=on]:[&>.tiptap-badge-text]:overflow-hidden [&>.tiptap-badge-icon]:pointer-events-none [&>.tiptap-badge-icon]:shrink-0 [&>.tiptap-badge-icon]:w-2.5 [&>.tiptap-badge-icon]:h-2.5",
  {
    variants: {
      size: {
        default: "h-5 min-w-5 p-1",
        large:
          "text-xs h-6 min-w-6 p-1.5 rounded-md [&>.tiptap-badge-icon]:w-3 [&>.tiptap-badge-icon]:h-3",
        small: "h-4 min-w-4 p-0.5 rounded-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tiptapBadgeVariants> {
  variant?: "ghost" | "white" | "gray" | "green" | "default"
  appearance?: "default" | "subdued" | "emphasized"
  trimText?: boolean
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
        className={cn("tiptap-badge", tiptapBadgeVariants({ size }), className)}
        data-style={variant}
        data-size={size}
        data-appearance={appearance}
        data-text-trim={trimText ? "on" : "off"}
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

export default Badge
