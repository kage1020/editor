"use client"

import { forwardRef, useCallback } from "react"
import type { UseMarkConfig } from "@/components/tiptap-ui/mark-button"
import { useMark } from "@/components/tiptap-ui/mark-button"

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonIcon } from "@/components/tiptap-ui-primitive/button"

interface MarkButtonProps extends Omit<ButtonProps, "type">, UseMarkConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
}

/**
 * Button component for toggling marks in a Tiptap editor.
 *
 * For custom button implementations, use the `useMark` hook instead.
 */
export const MarkButton = forwardRef<HTMLButtonElement, MarkButtonProps>(
  ({ type, text, onToggled, onClick, children, ...buttonProps }, ref) => {
    const { handleMark, label, canToggle, isActive, Icon } = useMark({
      type,
      onToggled,
    })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleMark()
      },
      [handleMark, onClick],
    )

    return (
      <Button
        type="button"
        disabled={!canToggle}
        data-style="ghost"
        active={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <ButtonIcon>
              <Icon />
            </ButtonIcon>
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  },
)

MarkButton.displayName = "MarkButton"
