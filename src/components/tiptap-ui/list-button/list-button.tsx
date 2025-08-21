"use client"

import { Badge } from "@/components/tiptap-ui-primitive/badge"
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonIcon } from "@/components/tiptap-ui-primitive/button"
import type {
  ListType,
  UseListConfig,
} from "@/components/tiptap-ui/list-button"
import { LIST_SHORTCUT_KEYS, useList } from "@/components/tiptap-ui/list-button"
import { parseShortcutKeys } from "@/lib/tiptap-utils"
import { forwardRef, useCallback } from "react"

export interface ListButtonProps
  extends Omit<ButtonProps, "type">,
    UseListConfig {
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

export function ListShortcutBadge({
  type,
  shortcutKeys = LIST_SHORTCUT_KEYS[type],
}: {
  type: ListType
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

/**
 * Button component for toggling lists in a Tiptap editor.
 *
 * For custom button implementations, use the `useList` hook instead.
 */
export const ListButton = forwardRef<HTMLButtonElement, ListButtonProps>(
  (
    {
      type,
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
      useList({
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
            {showShortcut && (
              <ListShortcutBadge type={type} shortcutKeys={shortcutKeys} />
            )}
          </>
        )}
      </Button>
    )
  },
)

ListButton.displayName = "ListButton"
