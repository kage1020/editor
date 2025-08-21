"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const Card = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "tiptap-card",
          "rounded-xl shadow-xl shadow-neutral-800 dark:shadow-black bg-white dark:bg-zinc-950 border border-solid border-neutral-100 dark:border-neutral-900 flex flex-col outline-none items-center relative min-w-0 break-words bg-clip-border",
          className,
        )}
        {...props}
      />
    )
  },
)
Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "tiptap-card-header",
          "p-1.5 flex-none flex items-center justify-between w-full border-b border-solid border-neutral-100 dark:border-neutral-900",
          className,
        )}
        {...props}
      />
    )
  },
)
CardHeader.displayName = "CardHeader"

const CardBody = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
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

const CardItemGroup = forwardRef<
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

const CardGroupLabel = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "tiptap-card-group-label",
          "pt-3 px-2 pb-1 leading-normal text-xs font-semibold capitalize text-neutral-800 dark:text-neutral-200",
          className,
        )}
        {...props}
      />
    )
  },
)
CardGroupLabel.displayName = "CardGroupLabel"

const CardFooter = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("tiptap-card-footer", "p-1.5 flex-none", className)}
        {...props}
      />
    )
  },
)
CardFooter.displayName = "CardFooter"

export { Card, CardBody, CardFooter, CardGroupLabel, CardHeader, CardItemGroup }
