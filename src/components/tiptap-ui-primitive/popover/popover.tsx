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
      top: "",
      "top-start": "",
      "top-end": "",
      right: "",
      "right-start": "",
      "right-end": "",
      bottom: "",
      "bottom-start": "",
      "bottom-end": "",
      left: "",
      "left-start": "",
      "left-end": "",
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
          "z-50 outline-none repeat-1 max-h-[var(--radix-popover-content-available-height)] [&>*]:max-h-[var(--radix-popover-content-available-height)]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-(--kg-dur-2) data-[state=open]:ease-out data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-(--kg-dur-1) data-[state=closed]:ease-in data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
          popoverVariants({ side }),
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}
