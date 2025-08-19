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
          "rounded-xl shadow-[0_16px_48px_rgba(17,24,39,0.04),0_12px_24px_rgba(17,24,39,0.04),0_6px_8px_rgba(17,24,39,0.02),0_2px_3px_rgba(17,24,39,0.02)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5),0_12px_24px_rgba(0,0,0,0.24),0_6px_8px_rgba(0,0,0,0.22),0_2px_3px_rgba(0,0,0,0.12)] bg-white dark:bg-zinc-950 border border-solid border-neutral-100 dark:border-neutral-900 flex flex-col outline-none items-center relative min-w-0 break-words bg-clip-border",
          className
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
          className
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
          className
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
        orientation === "vertical" ? "flex-col justify-center" : "gap-1 flex-row items-center",
        className
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
          className
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
        className={cn(
          "tiptap-card-footer",
          "p-1.5 flex-none",
          className
        )}
        {...props}
      />
    )
  },
)
CardFooter.displayName = "CardFooter"

export { Card, CardBody, CardFooter, CardGroupLabel, CardHeader, CardItemGroup }
