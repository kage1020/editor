"use client"

import { forwardRef, useCallback } from "react"
import {
  Button,
  type ButtonProps,
  IconButton,
} from "@/components/tiptap-ui-primitive/button"
import { type UseCodeBlockConfig, useCodeBlock } from "./use-code-block"

interface CodeBlockButtonProps
  extends Omit<ButtonProps, "type">,
    UseCodeBlockConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
}

/**
 * Button component for toggling code block in a Tiptap editor.
 *
 * For custom button implementations, use the `useCodeBlock` hook instead.
 */
export const CodeBlockButton = forwardRef<
  HTMLButtonElement,
  CodeBlockButtonProps
>(({ text, onToggled, onClick, children, ...buttonProps }, ref) => {
  const { canToggle, isActive, handleToggle, label, Icon } = useCodeBlock({
    onToggled,
  })

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (event.defaultPrevented) return
      handleToggle()
    },
    [handleToggle, onClick],
  )

  return (
    <Button
      type="button"
      data-style="ghost"
      active={isActive ? "on" : "off"}
      role="button"
      disabled={!canToggle}
      tabIndex={-1}
      aria-label={label}
      aria-pressed={isActive}
      tooltip="Code Block"
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

CodeBlockButton.displayName = "CodeBlockButton"
