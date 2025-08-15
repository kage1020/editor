"use client"

import { forwardRef, useCallback } from "react"
import type { UseDetailsConfig } from "@/components/tiptap-ui/details-button"
import {
  DETAILS_SHORTCUT_KEY,
  useDetails,
} from "@/components/tiptap-ui/details-button"
import { Badge } from "@/components/tiptap-ui-primitive/badge"

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
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
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onToggled,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const {
      isVisible,
      canToggle,
      isActive,
      handleToggle,
      label,
      shortcutKeys,
      Icon,
    } = useDetails({
      editor,
      hideWhenUnavailable,
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

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type="button"
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        disabled={!canToggle}
        data-disabled={!canToggle}
        aria-label={label}
        aria-pressed={isActive}
        tooltip="Details"
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
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
