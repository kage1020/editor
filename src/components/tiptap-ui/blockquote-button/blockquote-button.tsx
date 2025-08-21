"use client"

import { Badge } from "@/components/tiptap-ui-primitive/badge"
import type { UseBlockquoteConfig } from "@/components/tiptap-ui/blockquote-button"
import {
  BLOCKQUOTE_SHORTCUT_KEY,
  useBlockquote,
} from "@/components/tiptap-ui/blockquote-button"
import { forwardRef, useCallback } from "react"

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonIcon } from "@/components/tiptap-ui-primitive/button"
import { parseShortcutKeys } from "@/lib/tiptap-utils"

export interface BlockquoteButtonProps
  extends Omit<ButtonProps, "type">,
    UseBlockquoteConfig {
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

export function BlockquoteShortcutBadge({
  shortcutKeys = BLOCKQUOTE_SHORTCUT_KEY,
}: {
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

/**
 * Button component for toggling blockquote in a Tiptap editor.
 *
 * For custom button implementations, use the `useBlockquote` hook instead.
 */
export const BlockquoteButton = forwardRef<
  HTMLButtonElement,
  BlockquoteButtonProps
>(
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
      useBlockquote({
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
            {showShortcut && (
              <BlockquoteShortcutBadge shortcutKeys={shortcutKeys} />
            )}
          </>
        )}
      </Button>
    )
  },
)

BlockquoteButton.displayName = "BlockquoteButton"
