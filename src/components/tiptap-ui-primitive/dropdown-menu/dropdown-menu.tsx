"use client"

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cva } from "class-variance-authority"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

export function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root modal={false} {...props} />
}

export function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal {...props} />
}

export const DropdownMenuTrigger = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ ...props }, ref) => <DropdownMenuPrimitive.Trigger ref={ref} {...props} />)
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName

export const DropdownMenuGroup = DropdownMenuPrimitive.Group

export const DropdownMenuSub = DropdownMenuPrimitive.Sub

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

export const DropdownMenuItem = DropdownMenuPrimitive.Item

export const DropdownMenuSubTrigger = DropdownMenuPrimitive.SubTrigger

export const DropdownMenuSubContent = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> & {
    portal?: boolean | React.ComponentProps<typeof DropdownMenuPortal>
  }
>(({ className, portal = true, ...props }, ref) => {
  const content = (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        "tiptap-dropdown-menu",
        "z-50 outline-none duration-150 ease-fast count repeat-1 max-h-[var(--radix-dropdown-menu-content-available-height)] [&>*]:max-h-[var(--radix-dropdown-menu-content-available-height)]",
        "data-[state=open]:animate-fadeInZoomIn data-[state=closed]:animate-fadeOutZoomOut",
        "data-[side=top]:animate-slideFromBottom data-[side=top-start]:animate-slideFromBottom data-[side=top-end]:animate-slideFromBottom data-[side=right]:animate-slideFromLeft data-[side=right-start]:animate-slideFromLeft data-[side=right-end]:animate-slideFromLeft data-[side=bottom]:animate-slideFromTop data-[side=bottom-start]:animate-slideFromTop data-[side=bottom-end]:animate-slideFromTop data-[side=left]:animate-slideFromRight data-[side=left-start]:animate-slideFromRight data-[side=left-end]:animate-slideFromRight",
        className,
      )}
      {...props}
    />
  )

  return portal ? (
    <DropdownMenuPortal {...(typeof portal === "object" ? portal : {})}>
      {content}
    </DropdownMenuPortal>
  ) : (
    content
  )
})
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const dropdownMenuContentVariants = cva("", {
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
})

export const DropdownMenuContent = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    portal?: boolean
  }
>(({ className, sideOffset = 4, portal = false, side, ...props }, ref) => {
  const content = (
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      onCloseAutoFocus={(e) => e.preventDefault()}
      className={cn(
        "tiptap-dropdown-menu",
        "z-50 outline-none duration-150 repeat-1 ease-fast max-h-[var(--radix-dropdown-menu-content-available-height)] [&>*]:max-h-[var(--radix-dropdown-menu-content-available-height)]",
        "data-[state=open]:animate-fadeInZoomIn",
        "data-[state=closed]:animate-fadeOutZoomOut",
        dropdownMenuContentVariants({ side }),
        className,
      )}
      {...props}
    />
  )

  return portal ? (
    <DropdownMenuPortal {...(typeof portal === "object" ? portal : {})}>
      {content}
    </DropdownMenuPortal>
  ) : (
    content
  )
})
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName
