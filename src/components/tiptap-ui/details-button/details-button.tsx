"use client"

import { Badge } from "@/components/tiptap-ui-primitive/badge"
import type { UseDetailsConfig } from "@/components/tiptap-ui/details-button"
import {
  DETAILS_SHORTCUT_KEY,
  useDetails,
} from "@/components/tiptap-ui/details-button"
import { forwardRef, useCallback } from "react"

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonIcon } from "@/components/tiptap-ui-primitive/button"
import { parseShortcutKeys } from "@/lib/tiptap-utils"

export interface DetailsButtonProps
  extends Omit<ButtonProps, "type">,
    UseDetailsConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean
}

export function DetailsShortcutBadge({
  shortcutKeys = DETAILS_SHORTCUT_KEY,
}: {
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

/**
 * Button component for toggling details in a Tiptap editor.
 *
 * For custom button implementations, use the `useDetails` hook instead.
 */
export const DetailsButton = forwardRef<HTMLButtonElement, DetailsButtonProps>(
  (
    {
      text,
      onToggled,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { canToggle, isActive, handleToggle, label, shortcutKeys, Icon } =
      useDetails({
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
            <ButtonIcon>
              <Icon />
            </ButtonIcon>
            {text && <span className="tiptap-button-text text-sm">{text}</span>}
            {showShortcut && (
              <DetailsShortcutBadge shortcutKeys={shortcutKeys} />
            )}
          </>
        )}
      </Button>
    )
  },
)

DetailsButton.displayName = "DetailsButton"
