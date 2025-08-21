"use client"

import { forwardRef, useCallback } from "react"
import {
  Button,
  type ButtonProps,
  IconButton,
} from "@/components/tiptap-ui-primitive/button"
import { type UseDetailsConfig, useDetails } from "./use-details"

interface DetailsButtonProps
  extends Omit<ButtonProps, "type">,
    UseDetailsConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
}

/**
 * Button component for toggling details in a Tiptap editor.
 *
 * For custom button implementations, use the `useDetails` hook instead.
 */
export const DetailsButton = forwardRef<HTMLButtonElement, DetailsButtonProps>(
  ({ text, onToggled, onClick, children, ...buttonProps }, ref) => {
    const { canToggle, isActive, handleToggle, label, Icon } = useDetails({
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
        tooltip="Details"
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <IconButton>
              <Icon />
            </IconButton>
            {text && <span className="tiptap-button-text text-sm">{text}</span>}
          </>
        )}
      </Button>
    )
  },
)

DetailsButton.displayName = "DetailsButton"
