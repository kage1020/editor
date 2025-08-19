"use client"

import { forwardRef, useCallback, useMemo } from "react"
import type { UseColorHighlightConfig } from "@/components/tiptap-ui/color-highlight-button"
import {
  COLOR_HIGHLIGHT_SHORTCUT_KEY,
  useColorHighlight,
} from "@/components/tiptap-ui/color-highlight-button"
import { Badge } from "@/components/tiptap-ui-primitive/badge"

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { parseShortcutKeys } from "@/lib/tiptap-utils"

export interface ColorHighlightButtonProps
  extends Omit<ButtonProps, "type">,
    UseColorHighlightConfig {
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

export function ColorHighlightShortcutBadge({
  shortcutKeys = COLOR_HIGHLIGHT_SHORTCUT_KEY,
}: {
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

/**
 * Button component for applying color highlights in a Tiptap editor.
 *
 * For custom button implementations, use the `useColorHighlight` hook instead.
 */
export const ColorHighlightButton = forwardRef<
  HTMLButtonElement,
  ColorHighlightButtonProps
>(
  (
    {
      editor: providedEditor,
      highlightColor,
      text,
      hideWhenUnavailable = false,
      onApplied,
      showShortcut = false,
      onClick,
      children,
      style,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const {
      isVisible,
      canColorHighlight,
      isActive,
      handleColorHighlight,
      label,
      shortcutKeys,
    } = useColorHighlight({
      editor,
      highlightColor,
      label: text || `Toggle highlight (${highlightColor})`,
      hideWhenUnavailable,
      onApplied,
    })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleColorHighlight()
      },
      [handleColorHighlight, onClick],
    )

    const buttonStyle = useMemo(
      () =>
        ({
          ...style,
          "--highlight-color": highlightColor,
        }) as React.CSSProperties,
      [highlightColor, style],
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
        disabled={!canColorHighlight}
        data-disabled={!canColorHighlight}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        style={buttonStyle}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <span
              className="tiptap-button-highlight relative w-5 h-5 mx-[-0.175rem] rounded-xl transition-transform duration-200 ease-in-out after:content-[''] after:absolute after:w-full after:h-full after:left-0 after:top-0 after:rounded-[inherit] after:box-border after:border after:brightness-95 after:mix-blend-multiply dark:after:brightness-140 dark:after:mix-blend-lighten data-[active-state=on]:after:brightness-80 dark:data-[active-state=on]:after:brightness-180"
              style={
                { 
                  backgroundColor: highlightColor,
                  "--tw-border-opacity": "1",
                  borderColor: highlightColor
                } as React.CSSProperties
              }
            />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && (
              <ColorHighlightShortcutBadge shortcutKeys={shortcutKeys} />
            )}
          </>
        )}
      </Button>
    )
  },
)

ColorHighlightButton.displayName = "ColorHighlightButton"
