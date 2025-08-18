"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tiptap-ui-primitive/tooltip"
import { parseShortcutKeys } from "@/lib/tiptap-utils"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Fragment, forwardRef, useMemo } from "react"

const tiptapButtonVariants = cva(
  "text-sm font-medium [font-feature:'salt'_on,'cv01'_on] leading-[1.15] h-8 min-w-8 border-none p-2 gap-1 flex items-center justify-center rounded-[var(--tt-radius-lg,0.75rem)] transition-all duration-[var(--tt-transition-duration-default)] ease-[var(--tt-transition-easing-default)] focus-visible:outline-none bg-[var(--tt-button-default-bg-color)] text-[var(--tt-button-default-text-color)] [&>.tiptap-button-icon]:text-[var(--tt-button-default-icon-color)] [&>.tiptap-button-icon-sub]:text-[var(--tt-button-default-icon-sub-color)] [&>.tiptap-button-dropdown-arrows]:text-[var(--tt-button-default-dropdown-arrows-color)] [&>.tiptap-button-dropdown-small]:text-[var(--tt-button-default-dropdown-arrows-color)] hover:not-[[data-active-item='true']]:not-[:disabled]:bg-[var(--tt-button-hover-bg-color)] hover:not-[[data-active-item='true']]:not-[:disabled]:text-[var(--tt-button-hover-text-color)] hover:not-[[data-active-item='true']]:not-[:disabled]:[&>.tiptap-button-icon]:text-[var(--tt-button-hover-icon-color)] hover:not-[[data-active-item='true']]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-[var(--tt-button-hover-icon-sub-color)] hover:not-[[data-active-item='true']]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-[var(--tt-button-hover-dropdown-arrows-color)] hover:not-[[data-active-item='true']]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-[var(--tt-button-hover-dropdown-arrows-color)] data-[highlighted=true]:bg-[var(--tt-button-hover-bg-color)] data-[highlighted=true]:text-[var(--tt-button-hover-text-color)] data-[active-state=on]:not-[:disabled]:bg-[var(--tt-button-active-bg-color)] data-[active-state=on]:not-[:disabled]:text-[var(--tt-button-active-text-color)] data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-icon]:text-[var(--tt-button-active-icon-color)] data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-[var(--tt-button-active-icon-sub-color)] data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-[var(--tt-button-active-dropdown-arrows-color)] data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-[var(--tt-button-active-dropdown-arrows-color)] data-[active-state=on]:not-[:disabled]:hover:bg-[var(--tt-button-active-hover-bg-color)] data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:bg-[var(--tt-button-hover-bg-color)] data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:text-[var(--tt-button-hover-text-color)] data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:[&>.tiptap-button-icon]:text-[var(--tt-button-hover-icon-color)] data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:[&>.tiptap-button-icon-sub]:text-[var(--tt-button-hover-icon-sub-color)] data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:[&>.tiptap-button-dropdown-arrows]:text-[var(--tt-button-hover-dropdown-arrows-color)] data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:[&>.tiptap-button-dropdown-small]:text-[var(--tt-button-hover-dropdown-arrows-color)] data-[state=open]:not-[:disabled]:bg-[var(--tt-button-active-bg-color)] data-[state=open]:not-[:disabled]:text-[var(--tt-button-active-text-color)] data-[state=open]:not-[:disabled]:[&>.tiptap-button-icon]:text-[var(--tt-button-active-icon-color)] data-[state=open]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-[var(--tt-button-active-icon-sub-color)] data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-[var(--tt-button-active-dropdown-arrows-color)] data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-[var(--tt-button-active-dropdown-arrows-color)] data-[state=open]:not-[:disabled]:hover:bg-[var(--tt-button-active-hover-bg-color)] disabled:bg-[var(--tt-button-disabled-bg-color)] disabled:text-[var(--tt-button-disabled-text-color)] disabled:[&>.tiptap-button-icon]:text-[var(--tt-button-disabled-icon-color)] [&:has(>svg):not(:has(>:not(svg)))]:gap-0.5 [&>.tiptap-button-text]:px-0.5 [&>.tiptap-button-text]:flex-grow [&>.tiptap-button-text]:text-left [&>.tiptap-button-text]:leading-6 data-[text-trim=on]:[&>.tiptap-button-text]:text-ellipsis data-[text-trim=on]:[&>.tiptap-button-text]:overflow-hidden [&>.tiptap-button-icon]:w-4 [&>.tiptap-button-icon]:h-4 [&>.tiptap-button-icon-sub]:w-4 [&>.tiptap-button-icon-sub]:h-4 [&>.tiptap-button-dropdown-arrows]:w-3 [&>.tiptap-button-dropdown-arrows]:h-3 [&>.tiptap-button-dropdown-small]:w-2.5 [&>.tiptap-button-dropdown-small]:h-2.5 [&>.tiptap-button-icon]:shrink-0 [&>.tiptap-button-icon-sub]:shrink-0 [&>.tiptap-button-dropdown-arrows]:shrink-0 [&>.tiptap-button-dropdown-small]:shrink-0 [&>.tiptap-button-emoji]:w-4 [&>.tiptap-button-emoji]:flex [&>.tiptap-button-emoji]:justify-center [&:has(>svg:nth-of-type(2)):has(>.tiptap-button-dropdown-small):not(:has(>svg:nth-of-type(3))):not(:has(>.tiptap-button-text))]:gap-0 [&:has(>svg:nth-of-type(2)):has(>.tiptap-button-dropdown-small):not(:has(>svg:nth-of-type(3))):not(:has(>.tiptap-button-text))]:pr-1",
  {
    variants: {
      size: {
        default: "h-8 min-w-8 p-2",
        large:
          "text-[0.9375rem] h-[2.375rem] min-w-[2.375rem] p-2.5 [&>.tiptap-button-icon]:w-[1.125rem] [&>.tiptap-button-icon]:h-[1.125rem] [&>.tiptap-button-icon-sub]:w-[1.125rem] [&>.tiptap-button-icon-sub]:h-[1.125rem] [&>.tiptap-button-dropdown-arrows]:w-[0.875rem] [&>.tiptap-button-dropdown-arrows]:h-[0.875rem] [&>.tiptap-button-dropdown-small]:w-3 [&>.tiptap-button-dropdown-small]:h-3 [&>.tiptap-button-emoji]:w-[1.125rem] [&:has(>svg):not(:has(>:not(svg)))]:gap-0.5 [&:has(>svg:nth-of-type(2)):has(>.tiptap-button-dropdown-small):not(:has(>svg:nth-of-type(3))):not(:has(>.tiptap-button-text))]:pr-1.5",
        small:
          "text-xs leading-[1.2] h-6 min-w-6 p-[0.3125rem] rounded-[var(--tt-radius-md,0.5rem)] [&>.tiptap-button-icon]:w-3.5 [&>.tiptap-button-icon]:h-3.5 [&>.tiptap-button-icon-sub]:w-3.5 [&>.tiptap-button-icon-sub]:h-3.5 [&>.tiptap-button-dropdown-arrows]:w-2.5 [&>.tiptap-button-dropdown-arrows]:h-2.5 [&>.tiptap-button-dropdown-small]:w-2 [&>.tiptap-button-dropdown-small]:h-2 [&>.tiptap-button-emoji]:w-3.5 [&:has(>svg):not(:has(>:not(svg)))]:gap-0.5 [&:has(>svg:nth-of-type(2)):has(>.tiptap-button-dropdown-small):not(:has(>svg:nth-of-type(3))):not(:has(>.tiptap-button-text))]:pr-1",
      },
      weight: {
        default: "",
        small: "w-6 min-w-6 pr-0 pl-0",
      },
      appearance: {
        default: "",
        emphasized:
          "data-[active-state=on]:not-[:disabled]:bg-[var(--tt-button-active-bg-color-emphasized)] data-[active-state=on]:not-[:disabled]:text-[var(--tt-button-active-text-color-emphasized)] data-[active-state=on]:not-[:disabled]:[&>svg]:text-[var(--tt-button-active-icon-color-emphasized)] data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-[var(--tt-button-active-icon-sub-color-emphasized)] data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-[var(--tt-button-active-dropdown-arrows-color-emphasized)] data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-[var(--tt-button-active-dropdown-arrows-color-emphasized)] data-[active-state=on]:not-[:disabled]:hover:bg-[var(--tt-button-active-hover-bg-color-emphasized)] data-[state=open]:not-[:disabled]:bg-[var(--tt-button-active-bg-color-emphasized)] data-[state=open]:not-[:disabled]:text-[var(--tt-button-active-text-color-emphasized)] data-[state=open]:not-[:disabled]:[&>svg]:text-[var(--tt-button-active-icon-color-emphasized)] data-[state=open]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-[var(--tt-button-active-icon-sub-color-emphasized)] data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-[var(--tt-button-active-dropdown-arrows-color-emphasized)] data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-[var(--tt-button-active-dropdown-arrows-color-emphasized)] data-[state=open]:not-[:disabled]:hover:bg-[var(--tt-button-active-hover-bg-color-emphasized)]",
        subdued:
          "data-[active-state=on]:not-[:disabled]:bg-[var(--tt-button-active-bg-color-subdued)] data-[active-state=on]:not-[:disabled]:text-[var(--tt-button-active-text-color-subdued)] data-[active-state=on]:not-[:disabled]:[&>svg]:text-[var(--tt-button-active-icon-color-subdued)] data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-[var(--tt-button-active-icon-sub-color-subdued)] data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-[var(--tt-button-active-dropdown-arrows-color-subdued)] data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-[var(--tt-button-active-dropdown-arrows-color-subdued)] data-[active-state=on]:not-[:disabled]:hover:bg-[var(--tt-button-active-hover-bg-color-subdued)] data-[active-state=on]:not-[:disabled]:hover:[&>svg]:text-[var(--tt-button-active-icon-color-subdued)] data-[state=open]:not-[:disabled]:bg-[var(--tt-button-active-bg-color-subdued)] data-[state=open]:not-[:disabled]:text-[var(--tt-button-active-text-color-subdued)] data-[state=open]:not-[:disabled]:[&>svg]:text-[var(--tt-button-active-icon-color-subdued)] data-[state=open]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-[var(--tt-button-active-icon-sub-color-subdued)] data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-[var(--tt-button-active-dropdown-arrows-color-subdued)] data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-[var(--tt-button-active-dropdown-arrows-color-subdued)] data-[state=open]:not-[:disabled]:hover:bg-[var(--tt-button-active-hover-bg-color-subdued)] data-[state=open]:not-[:disabled]:hover:[&>svg]:text-[var(--tt-button-active-icon-color-subdued)]",
      },
    },
    defaultVariants: {
      size: "default",
      weight: "default",
      appearance: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tiptapButtonVariants> {
  className?: string
  showTooltip?: boolean
  tooltip?: React.ReactNode
  shortcutKeys?: string
}

export const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) return null

  return (
    <div>
      {shortcuts.map((key, index) => (
        <Fragment key={index}>
          {index > 0 && <kbd>+</kbd>}
          <kbd>{key}</kbd>
        </Fragment>
      ))}
    </div>
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      tooltip,
      showTooltip = true,
      shortcutKeys,
      size,
      weight,
      appearance,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const shortcuts = useMemo(
      () => parseShortcutKeys({ shortcutKeys }),
      [shortcutKeys],
    )

    const buttonClassName = cn(
      "tiptap-button",
      tiptapButtonVariants({ size, weight, appearance }),
      className,
    )

    if (!tooltip || !showTooltip) {
      return (
        <button
          className={buttonClassName}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </button>
      )
    }

    return (
      <Tooltip delay={200}>
        <TooltipTrigger
          className={buttonClassName}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {tooltip}
          <ShortcutDisplay shortcuts={shortcuts} />
        </TooltipContent>
      </Tooltip>
    )
  },
)

Button.displayName = "Button"

export const ButtonGroup = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    orientation?: "horizontal" | "vertical"
  }
>(({ className, children, orientation = "vertical", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "tiptap-button-group",
        "relative flex align-middle",
        orientation === "vertical"
          ? "flex-col items-start justify-center min-w-max [&>.tiptap-button]:w-full"
          : "gap-0.5 flex-row items-center",
        className,
      )}
      data-orientation={orientation}
      role="group"
      {...props}
    >
      {children}
    </div>
  )
})
ButtonGroup.displayName = "ButtonGroup"

export default Button
