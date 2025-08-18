"use client"

import { cn } from "@/lib/utils"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { forwardRef } from "react"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root modal={false} {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal {...props} />
}

const DropdownMenuTrigger = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ ...props }, ref) => <DropdownMenuPrimitive.Trigger ref={ref} {...props} />)
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuItem = DropdownMenuPrimitive.Item

const DropdownMenuSubTrigger = DropdownMenuPrimitive.SubTrigger

const DropdownMenuSubContent = forwardRef<
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
        "z-50 outline-none origin-[var(--radix-dropdown-menu-content-transform-origin)] max-h-[var(--radix-dropdown-menu-content-available-height)] [&>*]:max-h-[var(--radix-dropdown-menu-content-available-height)]",
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

const DropdownMenuContent = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    portal?: boolean
  }
>(({ className, sideOffset = 4, portal = false, ...props }, ref) => {
  const content = (
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      onCloseAutoFocus={(e) => e.preventDefault()}
      className={cn(
        "tiptap-dropdown-menu",
        "z-50 outline-none origin-[var(--radix-dropdown-menu-content-transform-origin)] max-h-[var(--radix-dropdown-menu-content-available-height)] [&>*]:max-h-[var(--radix-dropdown-menu-content-available-height)]",
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

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
