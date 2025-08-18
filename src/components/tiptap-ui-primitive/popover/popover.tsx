"use client"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "tiptap-popover",
          "z-50 outline-none origin-[var(--radix-popover-content-transform-origin)] max-h-[var(--radix-popover-content-available-height)] [&>*]:max-h-[var(--radix-popover-content-available-height)]",
          "data-[state=open]:animate-[fadeIn_150ms_cubic-bezier(0.16,1,0.3,1),zoomIn_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[state=closed]:animate-[fadeOut_150ms_cubic-bezier(0.16,1,0.3,1),zoomOut_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=top]:animate-[slideFromBottom_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=top-start]:animate-[slideFromBottom_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=top-end]:animate-[slideFromBottom_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=right]:animate-[slideFromLeft_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=right-start]:animate-[slideFromLeft_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=right-end]:animate-[slideFromLeft_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=bottom]:animate-[slideFromTop_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=bottom-start]:animate-[slideFromTop_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=bottom-end]:animate-[slideFromTop_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=left]:animate-[slideFromRight_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=left-start]:animate-[slideFromRight_150ms_cubic-bezier(0.16,1,0.3,1)]",
          "data-[side=left-end]:animate-[slideFromRight_150ms_cubic-bezier(0.16,1,0.3,1)]",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverContent, PopoverTrigger }
