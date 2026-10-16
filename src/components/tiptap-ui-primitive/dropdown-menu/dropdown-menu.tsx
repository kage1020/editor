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
        "z-50 outline-none duration-100 ease-fast count repeat-1 max-h-[var(--radix-dropdown-menu-content-available-height)] [&>*]:max-h-[var(--radix-dropdown-menu-content-available-height)]",
        "data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut",
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
        "z-50 outline-none duration-100 repeat-1 ease-fast max-h-[var(--radix-dropdown-menu-content-available-height)] [&>*]:max-h-[var(--radix-dropdown-menu-content-available-height)]",
        "data-[state=open]:animate-fadeIn",
        "data-[state=closed]:animate-fadeOut",
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
