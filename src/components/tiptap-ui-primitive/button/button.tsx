"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { cloneElement, Fragment, forwardRef, useMemo } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tiptap-ui-primitive/tooltip"
import { parseShortcutKeys } from "@/lib/tiptap-utils"
import { cn } from "@/lib/utils"

const tiptapButtonVariants = cva(
  "group/button text-sm font-medium [font-feature:'salt'_on,'cv01'_on] leading-[1.15] h-8 min-w-8 border-none p-2 gap-1 flex items-center justify-center rounded-lg transition-all duration-200 ease-in-out focus-visible:outline-none bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 data-[state=open]:bg-neutral-200 dark:data-[state=open]:bg-neutral-700 data-[state=open]:text-neutral-900 dark:data-[state=open]:text-neutral-100 data-[state=open]:hover:bg-neutral-300 dark:data-[state=open]:hover:bg-neutral-600 disabled:bg-neutral-50 dark:disabled:bg-neutral-900 disabled:text-neutral-400 dark:disabled:text-neutral-600 [&:has(>svg):not(:has(>:not(svg)))]:gap-0.5 [&_.tiptap-button-text]:px-0.5 [&_.tiptap-button-text]:flex-grow [&_.tiptap-button-text]:text-left [&_.tiptap-button-text]:leading-6 data-[text-trim=on]:[&_.tiptap-button-text]:text-ellipsis data-[text-trim=on]:[&_.tiptap-button-text]:overflow-hidden [&_.tiptap-button-emoji]:w-4 [&_.tiptap-button-emoji]:flex [&_.tiptap-button-emoji]:justify-center [&:has(>svg:nth-of-type(2)):has(>.tiptap-button-dropdown-small):not(:has(>svg:nth-of-type(3))):not(:has(>.tiptap-button-text))]:gap-0 [&:has(>svg:nth-of-type(2)):has(>.tiptap-button-dropdown-small):not(:has(>svg:nth-of-type(3))):not(:has(>.tiptap-button-text))]:pr-1",
  {
    variants: {
      size: {
        default: "h-8 min-w-8 p-2",
        large:
          "text-[0.9375rem] h-[2.375rem] min-w-[2.375rem] p-2.5 [&_.tiptap-button-emoji]:w-[1.125rem] [&:has(>svg):not(:has(>:not(svg)))]:gap-0.5 [&:has(>svg:nth-of-type(2)):has(>.tiptap-button-dropdown-small):not(:has(>svg:nth-of-type(3))):not(:has(>.tiptap-button-text))]:pr-1.5",
        small:
          "text-xs leading-[1.2] h-6 min-w-6 p-[0.3125rem] rounded-md [&_.tiptap-button-emoji]:w-3.5 [&:has(>svg):not(:has(>:not(svg)))]:gap-0.5 [&:has(>svg:nth-of-type(2)):has(>.tiptap-button-dropdown-small):not(:has(>svg:nth-of-type(3))):not(:has(>.tiptap-button-text))]:pr-1",
      },
      weight: {
        default: "",
        small: "w-6 min-w-6 pr-0 pl-0",
      },
      appearance: {
        default: "",
        emphasized:
          "data-[state=open]:bg-neutral-200 dark:data-[state=open]:bg-neutral-700 data-[state=open]:text-neutral-900 dark:data-[state=open]:text-neutral-100 data-[state=open]:[&_svg]:text-neutral-700 dark:data-[state=open]:[&_svg]:text-neutral-300 data-[state=open]:hover:bg-neutral-300 dark:data-[state=open]:hover:bg-neutral-600",
        subdued:
          "data-[state=open]:bg-neutral-200 dark:data-[state=open]:bg-neutral-700 data-[state=open]:text-neutral-900 dark:data-[state=open]:text-neutral-100 data-[state=open]:[&_svg]:text-neutral-900 dark:data-[state=open]:[&_svg]:text-neutral-100 data-[state=open]:hover:bg-neutral-300 dark:data-[state=open]:hover:bg-neutral-600 data-[state=open]:hover:[&_svg]:text-neutral-900 dark:data-[state=open]:hover:[&_svg]:text-neutral-100",
      },
      active: {
        on: "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600",
        off: "",
      },
    },
    defaultVariants: {
      size: "default",
      weight: "default",
      appearance: "default",
      active: "off",
    },
    compoundVariants: [
      {
        appearance: "emphasized",
        active: "on",
        className:
          "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 [&_svg]:text-neutral-700 dark:[&_svg]:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600",
      },
    ],
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tiptapButtonVariants> {
  className?: string
  showTooltip?: boolean
  tooltip?: React.ReactNode
  shortcutKeys?: string
  active?: "on" | "off"
}

const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({ shortcuts }) => {
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
      active,
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
      "tiptap-button cursor-pointer",
      tiptapButtonVariants({ size, weight, appearance, active }),
      className,
    )

    if (!tooltip || !showTooltip) {
      return (
        <button
          className={buttonClassName}
          ref={ref}
          data-size={size}
          data-appearance={appearance}
          data-active={active}
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
          data-size={size}
          data-appearance={appearance}
          data-active={active}
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
          ? "flex-col items-start justify-center min-w-max [&_.tiptap-button]:w-full"
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

const buttonIconVariants = cva("shrink-0", {
  variants: {
    variant: {
      default:
        "w-4 h-4 text-neutral-600 dark:text-neutral-400 group-data-[state=open]/button:text-neutral-600 dark:group-data-[state=open]/button:text-neutral-400 group-disabled/button:text-neutral-400 dark:group-disabled/button:text-neutral-600 group-data-[size=large]/button:w-[1.125rem] group-data-[size=large]/button:h-[1.125rem] group-data-[size=small]/button:w-3.5 group-data-[size=small]/button:h-3.5 group-data-[active=on]/button:text-neutral-600 dark:group-data-[active=on]/button:text-neutral-400",
      sub: "w-4 h-4 text-neutral-400 dark:text-neutral-600 group-data-[state=open]/button:text-neutral-400 dark:group-data-[state=open]/button:text-neutral-600 group-data-[size=large]/button:w-[1.125rem] group-data-[size=large]/button:h-[1.125rem] group-data-[size=small]/button:w-3.5 group-data-[size=small]/button:h-3.5 group-data-[state=open]/button:group-data-[appearance=emphasized]/button:text-neutral-500 dark:group-data-[state=open]/button:group-data-[appearance=emphasized]/button:text-neutral-500 group-data-[state=open]/button:group-data-[appearance=subdued]/button:text-neutral-400 dark:group-data-[state=open]/button:group-data-[appearance=subdued]/button:text-neutral-600 group-data-[active=on]/button:text-neutral-400 dark:group-data-[active=on]/button:text-neutral-600 group-data-[appearance=emphasized]/button:group-data-[active=on]/button:text-neutral-500 dark:group-data-[appearance=emphasized]/button:group-data-[active=on]/button:text-neutral-500",
      "dropdown-arrows":
        "w-3 h-3 text-neutral-600 dark:text-neutral-400 group-data-[state=open]/button:text-neutral-600 dark:group-data-[state=open]/button:text-neutral-400 group-data-[size=large]/button:w-[0.875rem] group-data-[size=large]/button:h-[0.875rem] group-data-[size=small]/button:w-2.5 group-data-[size=small]/button:h-2.5 group-data-[state=open]/button:group-data-[appearance=emphasized]/button:text-neutral-700 dark:group-data-[state=open]/button:group-data-[appearance=emphasized]/button:text-neutral-300 group-data-[state=open]/button:group-data-[appearance=subdued]/button:text-neutral-600 dark:group-data-[state=open]/button:group-data-[appearance=subdued]/button:text-neutral-400 group-data-[active=on]/button:text-neutral-600 dark:group-data-[active=on]/button:text-neutral-400 group-data-[appearance=emphasized]/button:group-data-[active=on]/button:text-neutral-700 dark:group-data-[appearance=emphasized]/button:group-data-[active=on]/button:text-neutral-300",
      "dropdown-small":
        "w-2.5 h-2.5 text-neutral-600 dark:text-neutral-400 group-data-[state=open]/button:text-neutral-600 dark:group-data-[state=open]/button:text-neutral-400 group-data-[size=large]/button:w-3 group-data-[size=large]/button:h-3 group-data-[size=small]/button:w-2 group-data-[size=small]/button:h-2 group-data-[state=open]/button:group-data-[appearance=emphasized]/button:text-neutral-700 dark:group-data-[state=open]/button:group-data-[appearance=emphasized]/button:text-neutral-300 group-data-[state=open]/button:group-data-[appearance=subdued]/button:text-neutral-600 dark:group-data-[state=open]/button:group-data-[appearance=subdued]/button:text-neutral-400 group-data-[active=on]/button:text-neutral-600 dark:group-data-[active=on]/button:text-neutral-400 group-data-[appearance=emphasized]/button:group-data-[active=on]/button:text-neutral-700 dark:group-data-[appearance=emphasized]/button:group-data-[active=on]/button:text-neutral-300",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface ButtonIconProps
  extends React.ComponentPropsWithoutRef<"svg">,
    VariantProps<typeof buttonIconVariants> {
  children: React.ReactElement<React.SVGProps<SVGSVGElement>>
  className?: string
}

export const IconButton = forwardRef<SVGSVGElement, ButtonIconProps>(
  ({ className, variant, children, ...props }, ref) => {
    return cloneElement(children, {
      className: cn(
        variant === "default" && "tiptap-button-icon",
        variant === "sub" && "tiptap-button-icon-sub",
        variant === "dropdown-arrows" && "tiptap-button-dropdown-arrows",
        variant === "dropdown-small" && "tiptap-button-dropdown-small",
        buttonIconVariants({ variant }),
        className,
      ),
      ref,
      ...props,
    })
  },
)

IconButton.displayName = "ButtonIcon"
