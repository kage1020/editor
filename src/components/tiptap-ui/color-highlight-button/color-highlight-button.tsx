"use client"

import { forwardRef, useCallback, useMemo } from "react"
import {
  Button,
  type ButtonProps,
} from "@/components/tiptap-ui-primitive/button"
import { cn } from "@/lib/utils"
import {
  type UseColorHighlightConfig,
  useColorHighlight,
} from "./use-color-highlight"

interface ColorHighlightButtonProps
  extends Omit<ButtonProps, "type">,
    UseColorHighlightConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Whether the button is currently highlighted.
   * @default false
   */
  highlighted?: boolean
}

/**
 * Button component for applying color highlights in a Tiptap editor.
 *
 * For custom button implementations, use the `useColorHighlight` hook instead.
 */
export const ColorHighlightButton = forwardRef<
  HTMLButtonElement,
  ColorHighlightButtonProps
>(
  (
    {
      className,
      highlightColor,
      text,
      onApplied,
      onClick,
      children,
      style,
      highlighted = false,
      disabled,
      ...buttonProps
    },
    ref,
  ) => {
    const { canColorHighlight, isActive, handleColorHighlight, label } =
      useColorHighlight({
        highlightColor,
        label: text || `Toggle highlight (${highlightColor})`,
        onApplied,
      })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleColorHighlight()
      },
      [handleColorHighlight, onClick],
    )

    const buttonStyle = useMemo(
      () =>
        ({
          ...style,
          "--highlight-color": highlightColor,
        }) as React.CSSProperties,
      [highlightColor, style],
    )

    return (
      <Button
        type="button"
        variant="ghost"
        active={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        className={cn(
          highlighted &&
            "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100",
          highlighted &&
            !disabled &&
            "dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 [&_.tiptap-button-icon]:text-neutral-900 dark:[&_.tiptap-button-icon]:text-neutral-100 [&_.tiptap-button-icon-sub]:text-neutral-500 dark:[&_.tiptap-button-icon-sub]:text-neutral-500 [&_.tiptap-button-dropdown-arrows]:text-neutral-700 dark:[&_.tiptap-button-dropdown-arrows]:text-neutral-300 [&_.tiptap-button-dropdown-small]:text-neutral-700 dark:[&_.tiptap-button-dropdown-small]:text-neutral-300",
          isActive && "after:brightness-80 dark:after:brightness-180",
          className,
        )}
        disabled={!canColorHighlight}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        style={buttonStyle}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <span
              className="tiptap-button-highlight relative w-5 h-5 mx-[-0.175rem] rounded-xl transition-transform duration-200 ease-in-out after:content-[''] after:absolute after:w-full after:h-full after:left-0 after:top-0 after:rounded-[inherit] after:box-border after:border after:brightness-95 after:mix-blend-multiply dark:after:brightness-140 dark:after:mix-blend-lighten"
              style={
                {
                  backgroundColor: highlightColor,
                  "--tw-border-opacity": "1",
                  borderColor: highlightColor,
                } as React.CSSProperties
              }
            />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  },
)

ColorHighlightButton.displayName = "ColorHighlightButton"
