"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

export const Card = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "tiptap-card",
          "rounded-lg bg-kg-bg text-kg-ink border border-solid border-kg-line flex flex-col outline-none items-center relative min-w-0 break-words bg-clip-border",
          className,
        )}
        {...props}
      />
    )
  },
)
Card.displayName = "Card"

export const CardHeader = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "tiptap-card-header",
        "p-1.5 flex-none flex items-center justify-between w-full border-b border-solid border-kg-line",
        className,
      )}
      {...props}
    />
  )
})
CardHeader.displayName = "CardHeader"

export const CardBody = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "tiptap-card-body",
          "p-1.5 flex-auto overflow-y-auto",
          className,
        )}
        {...props}
      />
    )
  },
)
CardBody.displayName = "CardBody"

export const CardItemGroup = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, orientation = "vertical", ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-orientation={orientation}
      className={cn(
        "tiptap-card-item-group",
        "relative flex align-middle min-w-max",
        orientation === "vertical"
          ? "flex-col justify-center"
          : "gap-1 flex-row items-center",
        className,
      )}
      {...props}
    />
  )
})
CardItemGroup.displayName = "CardItemGroup"

export const CardGroupLabel = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "tiptap-card-group-label",
        "pt-3 px-2 pb-1 leading-normal text-xs font-normal capitalize text-kg-ink-muted",
        className,
      )}
      {...props}
    />
  )
})
CardGroupLabel.displayName = "CardGroupLabel"

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("tiptap-card-footer", "p-1.5 flex-none", className)}
      {...props}
    />
  )
})
CardFooter.displayName = "CardFooter"
