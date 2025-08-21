"use client"

import { forwardRef, useCallback } from "react"
import {
  Button,
  type ButtonProps,
  IconButton,
} from "@/components/tiptap-ui-primitive/button"
import { type UseTextAlignConfig, useTextAlign } from "./use-text-align"

interface TextAlignButtonProps
  extends Omit<ButtonProps, "type">,
    UseTextAlignConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
}

/**
 * Button component for setting text alignment in a Tiptap editor.
 *
 * For custom button implementations, use the `useTextAlign` hook instead.
 */
export const TextAlignButton = forwardRef<
  HTMLButtonElement,
  TextAlignButtonProps
>(({ align, text, onAligned, onClick, children, ...buttonProps }, ref) => {
  const { handleTextAlign, label, canAlign, isActive, Icon } = useTextAlign({
    align,
    onAligned,
  })

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (event.defaultPrevented) return
      handleTextAlign()
    },
    [handleTextAlign, onClick],
  )

  return (
    <Button
      type="button"
      disabled={!canAlign}
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
          <IconButton>
            <Icon />
          </IconButton>
          {text && <span className="tiptap-button-text">{text}</span>}
        </>
      )}
    </Button>
  )
})

TextAlignButton.displayName = "TextAlignButton"
