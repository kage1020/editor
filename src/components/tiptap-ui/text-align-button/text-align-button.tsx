"use client"

import { Badge } from "@/components/tiptap-ui-primitive/badge"
import type {
  TextAlign,
  UseTextAlignConfig,
} from "@/components/tiptap-ui/text-align-button"
import {
  TEXT_ALIGN_SHORTCUT_KEYS,
  useTextAlign,
} from "@/components/tiptap-ui/text-align-button"
import { forwardRef, useCallback } from "react"

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonIcon } from "@/components/tiptap-ui-primitive/button"
import { parseShortcutKeys } from "@/lib/tiptap-utils"

export interface TextAlignButtonProps
  extends Omit<ButtonProps, "type">,
    UseTextAlignConfig {
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

export function TextAlignShortcutBadge({
  align,
  shortcutKeys = TEXT_ALIGN_SHORTCUT_KEYS[align],
}: {
  align: TextAlign
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

/**
 * Button component for setting text alignment in a Tiptap editor.
 *
 * For custom button implementations, use the `useTextAlign` hook instead.
 */
export const TextAlignButton = forwardRef<
  HTMLButtonElement,
  TextAlignButtonProps
>(
  (
    {
      align,
      text,
      onAligned,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { handleTextAlign, label, canAlign, isActive, Icon, shortcutKeys } =
      useTextAlign({
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
            <ButtonIcon>
              <Icon />
            </ButtonIcon>
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && (
              <TextAlignShortcutBadge
                align={align}
                shortcutKeys={shortcutKeys}
              />
            )}
          </>
        )}
      </Button>
    )
  },
)

TextAlignButton.displayName = "TextAlignButton"
