"use client"

import type { Editor } from "@tiptap/react"
import { useCallback } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { isMarkInSchema, isNodeTypeSelected } from "@/lib/tiptap-utils"

const COLOR_HIGHLIGHT_SHORTCUT_KEY = "mod+shift+h"
const HIGHLIGHT_COLORS = [
  {
    label: "Default background",
    value: "transparent",
    border: "rgba(0,0,0,0.1)",
  },
  {
    label: "Gray background",
    value: "rgb(248, 248, 247)",
    border: "rgba(84, 72, 49, 0.15)",
  },
  {
    label: "Brown background",
    value: "rgb(244, 238, 238)",
    border: "rgba(210, 162, 141, 0.35)",
  },
  {
    label: "Orange background",
    value: "rgb(251, 236, 221)",
    border: "rgba(224, 124, 57, 0.27)",
  },
  {
    label: "Yellow background",
    value: "#fef9c3",
    border: "#fbe604",
  },
  {
    label: "Green background",
    value: "#dcfce7",
    border: "#c7fad8",
  },
  {
    label: "Blue background",
    value: "#e0f2fe",
    border: "#ceeafd",
  },
  {
    label: "Purple background",
    value: "#f3e8ff",
    border: "#e4ccff",
  },
  {
    label: "Pink background",
    value: "rgb(252, 241, 246)",
    border: "rgba(225, 136, 179, 0.27)",
  },
  {
    label: "Red background",
    value: "#ffe4e6",
    border: "#ffccd0",
  },
]
export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number]

/**
 * Configuration for the color highlight functionality
 */
export interface UseColorHighlightConfig {
  /**
   * The color to apply when toggling the highlight.
   */
  highlightColor?: string
  /**
   * Optional label to display alongside the icon.
   */
  label?: string
  /**
   * Called when the highlight is applied.
   */
  onApplied?: ({ color, label }: { color: string; label: string }) => void
}

export function pickHighlightColorsByValue(values: string[]) {
  const colorMap = new Map(
    HIGHLIGHT_COLORS.map((color) => [color.value, color]),
  )
  return values
    .map((value) => colorMap.get(value))
    .filter((color): color is (typeof HIGHLIGHT_COLORS)[number] => !!color)
}

function canColorHighlight(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isMarkInSchema("highlight", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false

  return editor.can().setMark("highlight")
}

function isColorHighlightActive(
  editor: Editor | null,
  highlightColor?: string,
): boolean {
  if (!editor || !editor.isEditable) return false
  return highlightColor
    ? editor.isActive("highlight", { color: highlightColor })
    : editor.isActive("highlight")
}

function removeHighlight(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canColorHighlight(editor)) return false

  return editor.chain().focus().unsetMark("highlight").run()
}

export function useColorHighlight(config: UseColorHighlightConfig) {
  const { label, highlightColor, onApplied } = config

  const { editor } = useTiptapEditor()
  const isMobile = useIsMobile()
  const canColorHighlightState = canColorHighlight(editor)
  const isActive = isColorHighlightActive(editor, highlightColor)

  const handleColorHighlight = useCallback(() => {
    if (!editor || !canColorHighlightState || !highlightColor || !label)
      return false

    const success = editor
      .chain()
      .focus()
      .toggleMark("highlight", { color: highlightColor })
      .run()
    if (success) {
      onApplied?.({ color: highlightColor, label })
    }
    return success
  }, [canColorHighlightState, highlightColor, editor, label, onApplied])

  const handleRemoveHighlight = useCallback(() => {
    const success = removeHighlight(editor)
    if (success) {
      onApplied?.({ color: "", label: "Remove highlight" })
    }
    return success
  }, [editor, onApplied])

  useHotkeys(
    COLOR_HIGHLIGHT_SHORTCUT_KEY,
    (event) => {
      event.preventDefault()
      handleColorHighlight()
    },
    {
      enabled: canColorHighlightState,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    },
  )

  return {
    isActive,
    handleColorHighlight,
    handleRemoveHighlight,
    canColorHighlight: canColorHighlightState,
    label: label || `Highlight`,
    shortcutKeys: COLOR_HIGHLIGHT_SHORTCUT_KEY,
    Icon: HighlighterIcon,
  }
}
