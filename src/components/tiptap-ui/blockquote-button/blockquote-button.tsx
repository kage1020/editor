"use client"

import { forwardRef, useCallback } from "react"
import {
  Button,
  ButtonIcon,
  type ButtonProps,
} from "@/components/tiptap-ui-primitive/button"
import { type UseBlockquoteConfig, useBlockquote } from "./use-blockquote"

interface BlockquoteButtonProps
  extends Omit<ButtonProps, "type">,
    UseBlockquoteConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
}

/**
 * Button component for toggling blockquote in a Tiptap editor.
 *
 * For custom button implementations, use the `useBlockquote` hook instead.
 */
export const BlockquoteButton = forwardRef<
  HTMLButtonElement,
  BlockquoteButtonProps
>(({ text, onToggled, onClick, children, ...buttonProps }, ref) => {
  const { canToggle, isActive, handleToggle, label, Icon } = useBlockquote({
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
      tabIndex={-1}
      disabled={!canToggle}
      aria-label={label}
      aria-pressed={isActive}
      tooltip="Blockquote"
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
})

BlockquoteButton.displayName = "BlockquoteButton"
