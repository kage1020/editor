"use client"

import { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tiptapBadgeVariants = cva(
  "text-[0.625rem] font-bold [font-feature:'salt'_on,'cv01'_on] leading-[1.15] flex items-center justify-center border border-solid rounded-[var(--tt-radius-sm,0.375rem)] transition-all duration-[var(--tt-transition-duration-default)] ease-[var(--tt-transition-easing-default)] bg-[var(--tt-badge-bg-color)] border-[var(--tt-badge-border-color)] text-[var(--tt-badge-text-color)] [&>.tiptap-badge-icon]:text-[var(--tt-badge-icon-color)] data-[appearance=emphasized]:bg-[var(--tt-badge-bg-color-emphasized)] data-[appearance=emphasized]:border-[var(--tt-badge-border-color-emphasized)] data-[appearance=emphasized]:text-[var(--tt-badge-text-color-emphasized)] data-[appearance=emphasized]:[&>.tiptap-badge-icon]:text-[var(--tt-badge-icon-color-emphasized)] data-[appearance=subdued]:bg-[var(--tt-badge-bg-color-subdued)] data-[appearance=subdued]:border-[var(--tt-badge-border-color-subdued)] data-[appearance=subdued]:text-[var(--tt-badge-text-color-subdued)] data-[appearance=subdued]:[&>.tiptap-badge-icon]:text-[var(--tt-badge-icon-color-subdued)] [&>.tiptap-badge-text]:px-0.5 [&>.tiptap-badge-text]:flex-grow [&>.tiptap-badge-text]:text-left data-[text-trim=on]:[&>.tiptap-badge-text]:text-ellipsis data-[text-trim=on]:[&>.tiptap-badge-text]:overflow-hidden [&>.tiptap-badge-icon]:pointer-events-none [&>.tiptap-badge-icon]:shrink-0 [&>.tiptap-badge-icon]:w-2.5 [&>.tiptap-badge-icon]:h-2.5",
  {
    variants: {
      size: {
        default: "h-5 min-w-5 p-1",
        large:
          "text-xs h-6 min-w-6 p-1.5 rounded-[var(--tt-radius-md,0.375rem)] [&>.tiptap-badge-icon]:w-3 [&>.tiptap-badge-icon]:h-3",
        small: "h-4 min-w-4 p-0.5 rounded-[var(--tt-radius-xs,0.25rem)]",
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
