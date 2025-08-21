"use client"

import type { Editor } from "@tiptap/react"
import { useCallback } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { BoldIcon } from "@/components/tiptap-icons/bold-icon"
import { Code2Icon } from "@/components/tiptap-icons/code2-icon"
import { ItalicIcon } from "@/components/tiptap-icons/italic-icon"
import { StrikeIcon } from "@/components/tiptap-icons/strike-icon"
import { SubscriptIcon } from "@/components/tiptap-icons/subscript-icon"
import { SuperscriptIcon } from "@/components/tiptap-icons/superscript-icon"
import { UnderlineIcon } from "@/components/tiptap-icons/underline-icon"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { isMarkInSchema, isNodeTypeSelected } from "@/lib/tiptap-utils"

type Mark =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "underline"
  | "superscript"
  | "subscript"

/**
 * Configuration for the mark functionality
 */
export interface UseMarkConfig {
  /**
   * The type of mark to toggle
   */
  type: Mark
  /**
   * Callback function called after a successful mark toggle.
   */
  onToggled?: () => void
}

const markIcons = {
  bold: BoldIcon,
  italic: ItalicIcon,
  underline: UnderlineIcon,
  strike: StrikeIcon,
  code: Code2Icon,
  superscript: SuperscriptIcon,
  subscript: SubscriptIcon,
}

const MARK_SHORTCUT_KEYS: Record<Mark, string> = {
  bold: "mod+b",
  italic: "mod+i",
  underline: "mod+u",
  strike: "mod+shift+s",
  code: "mod+e",
  superscript: "mod+.",
  subscript: "mod+,",
}

/**
 * Checks if a mark can be toggled in the current editor state
 */
function canToggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isMarkInSchema(type, editor) || isNodeTypeSelected(editor, ["image"]))
    return false

  return editor.can().toggleMark(type)
}

/**
 * Checks if a mark is currently active
 */
function isMarkActive(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive(type)
}

/**
 * Toggles a mark in the editor
 */
function toggleMark(editor: Editor | null, type: Mark): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canToggleMark(editor, type)) return false

  return editor.chain().focus().toggleMark(type).run()
}

/**
 * Gets the formatted mark name
 */
function getFormattedMarkName(type: Mark): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

/**
 * Custom hook that provides mark functionality for Tiptap editor
 */
export function useMark(config: UseMarkConfig) {
  const { type, onToggled } = config

  const { editor } = useTiptapEditor()
  const isMobile = useIsMobile()
  const canToggle = canToggleMark(editor, type)
  const isActive = isMarkActive(editor, type)

  const handleMark = useCallback(() => {
    if (!editor) return false

    const success = toggleMark(editor, type)
    if (success) {
      onToggled?.()
    }
    return success
  }, [editor, type, onToggled])

  useHotkeys(
    MARK_SHORTCUT_KEYS[type],
    (event) => {
      event.preventDefault()
      handleMark()
    },
    {
      enabled: canToggle,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    },
  )

  return {
    isActive,
    handleMark,
    canToggle,
    label: getFormattedMarkName(type),
    shortcutKeys: MARK_SHORTCUT_KEYS[type],
    Icon: markIcons[type],
  }
}
