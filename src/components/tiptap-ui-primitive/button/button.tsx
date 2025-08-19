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
  "text-sm font-medium [font-feature:'salt'_on,'cv01'_on] leading-[1.15] h-8 min-w-8 border-none p-2 gap-1 flex items-center justify-center rounded-lg transition-all duration-200 ease-[cubic-bezier(0.46,0.03,0.52,0.96)] focus-visible:outline-none bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 [&>.tiptap-button-icon]:text-neutral-600 dark:[&>.tiptap-button-icon]:text-neutral-400 [&>.tiptap-button-icon-sub]:text-neutral-400 dark:[&>.tiptap-button-icon-sub]:text-neutral-600 [&>.tiptap-button-dropdown-arrows]:text-neutral-600 dark:[&>.tiptap-button-dropdown-arrows]:text-neutral-400 [&>.tiptap-button-dropdown-small]:text-neutral-600 dark:[&>.tiptap-button-dropdown-small]:text-neutral-400 hover:not-[[data-active-item='true']]:not-[:disabled]:bg-neutral-200 dark:hover:not-[[data-active-item='true']]:not-[:disabled]:bg-neutral-700 hover:not-[[data-active-item='true']]:not-[:disabled]:text-neutral-900 dark:hover:not-[[data-active-item='true']]:not-[:disabled]:text-neutral-100 hover:not-[[data-active-item='true']]:not-[:disabled]:[&>.tiptap-button-icon]:text-neutral-900 dark:hover:not-[[data-active-item='true']]:not-[:disabled]:[&>.tiptap-button-icon]:text-neutral-100 hover:not-[[data-active-item='true']]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-500 dark:hover:not-[[data-active-item='true']]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-500 hover:not-[[data-active-item='true']]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-700 dark:hover:not-[[data-active-item='true']]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-300 hover:not-[[data-active-item='true']]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-700 dark:hover:not-[[data-active-item='true']]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-300 data-[highlighted=true]:bg-neutral-200 dark:data-[highlighted=true]:bg-neutral-700 data-[highlighted=true]:text-neutral-900 dark:data-[highlighted=true]:text-neutral-100 data-[active-state=on]:not-[:disabled]:bg-neutral-200 dark:data-[active-state=on]:not-[:disabled]:bg-neutral-700 data-[active-state=on]:not-[:disabled]:text-neutral-900 dark:data-[active-state=on]:not-[:disabled]:text-neutral-100 data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-icon]:text-violet-600 dark:data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-icon]:text-violet-400 data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-400 dark:data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-600 data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-600 dark:data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-400 data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-600 dark:data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-400 data-[active-state=on]:not-[:disabled]:hover:bg-neutral-300 dark:data-[active-state=on]:not-[:disabled]:hover:bg-neutral-600 data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:bg-neutral-200 dark:data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:bg-neutral-700 data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:text-neutral-900 dark:data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:text-neutral-100 data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:[&>.tiptap-button-icon]:text-neutral-900 dark:data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:[&>.tiptap-button-icon]:text-neutral-100 data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:[&>.tiptap-button-icon-sub]:text-neutral-500 dark:data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:[&>.tiptap-button-icon-sub]:text-neutral-500 data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:[&>.tiptap-button-dropdown-arrows]:text-neutral-700 dark:data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:[&>.tiptap-button-dropdown-arrows]:text-neutral-300 data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:[&>.tiptap-button-dropdown-small]:text-neutral-700 dark:data-[highlighted]:not-[:disabled]:not-data-[highlighted='false']:[&>.tiptap-button-dropdown-small]:text-neutral-300 data-[state=open]:not-[:disabled]:bg-neutral-200 dark:data-[state=open]:not-[:disabled]:bg-neutral-700 data-[state=open]:not-[:disabled]:text-neutral-900 dark:data-[state=open]:not-[:disabled]:text-neutral-100 data-[state=open]:not-[:disabled]:[&>.tiptap-button-icon]:text-violet-600 dark:data-[state=open]:not-[:disabled]:[&>.tiptap-button-icon]:text-violet-400 data-[state=open]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-400 dark:data-[state=open]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-600 data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-600 dark:data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-400 data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-600 dark:data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-400 data-[state=open]:not-[:disabled]:hover:bg-neutral-300 dark:data-[state=open]:not-[:disabled]:hover:bg-neutral-600 disabled:bg-neutral-50 dark:disabled:bg-neutral-900 disabled:text-neutral-400 dark:disabled:text-neutral-600 disabled:[&>.tiptap-button-icon]:text-neutral-400 dark:disabled:[&>.tiptap-button-icon]:text-neutral-600 [&:has(>svg):not(:has(>:not(svg)))]:gap-0.5 [&>.tiptap-button-text]:px-0.5 [&>.tiptap-button-text]:flex-grow [&>.tiptap-button-text]:text-left [&>.tiptap-button-text]:leading-6 data-[text-trim=on]:[&>.tiptap-button-text]:text-ellipsis data-[text-trim=on]:[&>.tiptap-button-text]:overflow-hidden [&>.tiptap-button-icon]:w-4 [&>.tiptap-button-icon]:h-4 [&>.tiptap-button-icon-sub]:w-4 [&>.tiptap-button-icon-sub]:h-4 [&>.tiptap-button-dropdown-arrows]:w-3 [&>.tiptap-button-dropdown-arrows]:h-3 [&>.tiptap-button-dropdown-small]:w-2.5 [&>.tiptap-button-dropdown-small]:h-2.5 [&>.tiptap-button-icon]:shrink-0 [&>.tiptap-button-icon-sub]:shrink-0 [&>.tiptap-button-dropdown-arrows]:shrink-0 [&>.tiptap-button-dropdown-small]:shrink-0 [&>.tiptap-button-emoji]:w-4 [&>.tiptap-button-emoji]:flex [&>.tiptap-button-emoji]:justify-center [&:has(>svg:nth-of-type(2)):has(>.tiptap-button-dropdown-small):not(:has(>svg:nth-of-type(3))):not(:has(>.tiptap-button-text))]:gap-0 [&:has(>svg:nth-of-type(2)):has(>.tiptap-button-dropdown-small):not(:has(>svg:nth-of-type(3))):not(:has(>.tiptap-button-text))]:pr-1",
  {
    variants: {
      size: {
        default: "h-8 min-w-8 p-2",
        large:
          "text-[0.9375rem] h-[2.375rem] min-w-[2.375rem] p-2.5 [&>.tiptap-button-icon]:w-[1.125rem] [&>.tiptap-button-icon]:h-[1.125rem] [&>.tiptap-button-icon-sub]:w-[1.125rem] [&>.tiptap-button-icon-sub]:h-[1.125rem] [&>.tiptap-button-dropdown-arrows]:w-[0.875rem] [&>.tiptap-button-dropdown-arrows]:h-[0.875rem] [&>.tiptap-button-dropdown-small]:w-3 [&>.tiptap-button-dropdown-small]:h-3 [&>.tiptap-button-emoji]:w-[1.125rem] [&:has(>svg):not(:has(>:not(svg)))]:gap-0.5 [&:has(>svg:nth-of-type(2)):has(>.tiptap-button-dropdown-small):not(:has(>svg:nth-of-type(3))):not(:has(>.tiptap-button-text))]:pr-1.5",
        small:
          "text-xs leading-[1.2] h-6 min-w-6 p-[0.3125rem] rounded-md [&>.tiptap-button-icon]:w-3.5 [&>.tiptap-button-icon]:h-3.5 [&>.tiptap-button-icon-sub]:w-3.5 [&>.tiptap-button-icon-sub]:h-3.5 [&>.tiptap-button-dropdown-arrows]:w-2.5 [&>.tiptap-button-dropdown-arrows]:h-2.5 [&>.tiptap-button-dropdown-small]:w-2 [&>.tiptap-button-dropdown-small]:h-2 [&>.tiptap-button-emoji]:w-3.5 [&:has(>svg):not(:has(>:not(svg)))]:gap-0.5 [&:has(>svg:nth-of-type(2)):has(>.tiptap-button-dropdown-small):not(:has(>svg:nth-of-type(3))):not(:has(>.tiptap-button-text))]:pr-1",
      },
      weight: {
        default: "",
        small: "w-6 min-w-6 pr-0 pl-0",
      },
      appearance: {
        default: "",
        emphasized:
          "data-[active-state=on]:not-[:disabled]:bg-violet-100 dark:data-[active-state=on]:not-[:disabled]:bg-violet-950 data-[active-state=on]:not-[:disabled]:text-neutral-900 dark:data-[active-state=on]:not-[:disabled]:text-neutral-100 data-[active-state=on]:not-[:disabled]:[&>svg]:text-violet-700 dark:data-[active-state=on]:not-[:disabled]:[&>svg]:text-violet-300 data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-500 dark:data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-500 data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-700 dark:data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-300 data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-700 dark:data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-300 data-[active-state=on]:not-[:disabled]:hover:bg-violet-200 dark:data-[active-state=on]:not-[:disabled]:hover:bg-violet-900 data-[state=open]:not-[:disabled]:bg-violet-100 dark:data-[state=open]:not-[:disabled]:bg-violet-950 data-[state=open]:not-[:disabled]:text-neutral-900 dark:data-[state=open]:not-[:disabled]:text-neutral-100 data-[state=open]:not-[:disabled]:[&>svg]:text-violet-700 dark:data-[state=open]:not-[:disabled]:[&>svg]:text-violet-300 data-[state=open]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-500 dark:data-[state=open]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-500 data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-700 dark:data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-300 data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-700 dark:data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-300 data-[state=open]:not-[:disabled]:hover:bg-violet-200 dark:data-[state=open]:not-[:disabled]:hover:bg-violet-900",
        subdued:
          "data-[active-state=on]:not-[:disabled]:bg-neutral-200 dark:data-[active-state=on]:not-[:disabled]:bg-neutral-700 data-[active-state=on]:not-[:disabled]:text-neutral-900 dark:data-[active-state=on]:not-[:disabled]:text-neutral-100 data-[active-state=on]:not-[:disabled]:[&>svg]:text-neutral-900 dark:data-[active-state=on]:not-[:disabled]:[&>svg]:text-neutral-100 data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-400 dark:data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-600 data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-600 dark:data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-400 data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-600 dark:data-[active-state=on]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-400 data-[active-state=on]:not-[:disabled]:hover:bg-neutral-300 dark:data-[active-state=on]:not-[:disabled]:hover:bg-neutral-600 data-[active-state=on]:not-[:disabled]:hover:[&>svg]:text-neutral-900 dark:data-[active-state=on]:not-[:disabled]:hover:[&>svg]:text-neutral-100 data-[state=open]:not-[:disabled]:bg-neutral-200 dark:data-[state=open]:not-[:disabled]:bg-neutral-700 data-[state=open]:not-[:disabled]:text-neutral-900 dark:data-[state=open]:not-[:disabled]:text-neutral-100 data-[state=open]:not-[:disabled]:[&>svg]:text-neutral-900 dark:data-[state=open]:not-[:disabled]:[&>svg]:text-neutral-100 data-[state=open]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-400 dark:data-[state=open]:not-[:disabled]:[&>.tiptap-button-icon-sub]:text-neutral-600 data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-600 dark:data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-arrows]:text-neutral-400 data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-600 dark:data-[state=open]:not-[:disabled]:[&>.tiptap-button-dropdown-small]:text-neutral-400 data-[state=open]:not-[:disabled]:hover:bg-neutral-300 dark:data-[state=open]:not-[:disabled]:hover:bg-neutral-600 data-[state=open]:not-[:disabled]:hover:[&>svg]:text-neutral-900 dark:data-[state=open]:not-[:disabled]:hover:[&>svg]:text-neutral-100",
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
