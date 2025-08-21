"use client"

import { forwardRef, useCallback } from "react"
import {
  Button,
  ButtonIcon,
  type ButtonProps,
} from "@/components/tiptap-ui-primitive/button"
import { type UseListConfig, useList } from "./use-list"

interface ListButtonProps extends Omit<ButtonProps, "type">, UseListConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
}

/**
 * Button component for toggling lists in a Tiptap editor.
 *
 * For custom button implementations, use the `useList` hook instead.
 */
export const ListButton = forwardRef<HTMLButtonElement, ListButtonProps>(
  ({ type, text, onToggled, onClick, children, ...buttonProps }, ref) => {
    const { canToggle, isActive, handleToggle, label, Icon } = useList({
      type,
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

ListButton.displayName = "ListButton"
