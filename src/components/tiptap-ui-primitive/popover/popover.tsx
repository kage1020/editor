"use client"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

export function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />
}

export function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger {...props} />
}

export const popoverVariants = cva("", {
  variants: {
    side: {
      top: "animate-slideFromBottom",
      "top-start": "animate-slideFromBottom",
      "top-end": "animate-slideFromBottom",
      right: "animate-slideFromLeft",
      "right-start": "animate-slideFromLeft",
      "right-end": "animate-slideFromLeft",
      bottom: "animate-slideFromTop",
      "bottom-start": "animate-slideFromTop",
      "bottom-end": "animate-slideFromTop",
      left: "animate-slideFromRight",
      "left-start": "animate-slideFromRight",
      "left-end": "animate-slideFromRight",
    },
  },
  defaultVariants: {
    side: "bottom",
  },
})

export function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  side = "bottom",
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "tiptap-popover",
          "z-50 outline-none duration-150 ease-fast repeat-1 max-h-[var(--radix-popover-content-available-height)] [&>*]:max-h-[var(--radix-popover-content-available-height)]",
          "data-[state=open]:animate-fadeInZoomIn data-[state=closed]:animate-fadeOutZoomOut",
          popoverVariants({ side }),
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}
