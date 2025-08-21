"use client"

import { Badge } from "@/components/tiptap-ui-primitive/badge"
import type { UseCodeBlockConfig } from "@/components/tiptap-ui/code-block-button"
import {
  CODE_BLOCK_SHORTCUT_KEY,
  useCodeBlock,
} from "@/components/tiptap-ui/code-block-button"
import { forwardRef, useCallback } from "react"

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonIcon } from "@/components/tiptap-ui-primitive/button"
import { parseShortcutKeys } from "@/lib/tiptap-utils"

export interface CodeBlockButtonProps
  extends Omit<ButtonProps, "type">,
    UseCodeBlockConfig {
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

export function CodeBlockShortcutBadge({
  shortcutKeys = CODE_BLOCK_SHORTCUT_KEY,
}: {
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

/**
 * Button component for toggling code block in a Tiptap editor.
 *
 * For custom button implementations, use the `useCodeBlock` hook instead.
 */
export const CodeBlockButton = forwardRef<
  HTMLButtonElement,
  CodeBlockButtonProps
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
      useCodeBlock({
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
            <ButtonIcon>
              <Icon />
            </ButtonIcon>
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && (
              <CodeBlockShortcutBadge shortcutKeys={shortcutKeys} />
            )}
          </>
        )}
      </Button>
    )
  },
)

CodeBlockButton.displayName = "CodeBlockButton"
