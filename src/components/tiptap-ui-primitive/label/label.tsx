"use client"

import { createElement, forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface BaseProps extends React.HTMLAttributes<HTMLElement> {
  as?: "label" | "div"
  onMouseDown?: React.MouseEventHandler<HTMLElement>
}

export type LabelProps<T extends "label" | "div"> = T extends "label"
  ? BaseProps & { htmlFor?: string }
  : BaseProps

export const Label = forwardRef<
  HTMLElement,
  LabelProps<"label"> | LabelProps<"div">
>(({ as = "div", ...props }, ref) => {
  const renderProps = { ...props }

  if (as === "label") {
    renderProps.onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
      // only prevent text selection if clicking inside the label itself
      const target = event.target as HTMLElement
      if (target.closest("button, input, select, textarea")) return
      props.onMouseDown?.(event)
      // prevent text selection when double clicking label
      if (!event.defaultPrevented && event.detail > 1) event.preventDefault()
    }
  }

  return createElement(as, {
    ...renderProps,
    ref,
    className: cn(
      "tiptap-label",
      "mt-3 mx-2 mb-1 text-xs font-semibold leading-normal capitalize text-neutral-800 dark:text-neutral-200",
      props.className
    ),
  })
})

Label.displayName = "Label"

export default Label
