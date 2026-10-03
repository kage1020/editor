"use client"

import type { Editor } from "@tiptap/react"
import { useCallback } from "react"
import { DetailsIcon } from "@/components/tiptap-icons"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { isNodeInSchema, isNodeTypeSelected } from "@/lib/tiptap-utils"

const DETAILS_SHORTCUT_KEY = "mod+shift+d"

/**
 * Configuration for the details functionality
 */
export interface UseDetailsConfig {
  /**
   * Callback function called after a successful toggle.
   */
  onToggled?: () => void
}

/**
 * Checks if details can be toggled in the current editor state
 */
function canToggleDetails(editor: Editor | null): boolean {
  if (!editor?.isEditable) return false
  if (
    !isNodeInSchema("details", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false

  return editor.can().toggleDetails()
}

/**
 * Toggles details formatting for the current selection
 */
function toggleDetails(editor: Editor | null): boolean {
  if (!editor?.isEditable) return false
  if (!canToggleDetails(editor)) return false

  return editor.chain().focus().toggleDetails().run()
}

/**
 * Custom hook that provides details functionality for Tiptap editor
 */
export function useDetails(config?: UseDetailsConfig) {
  const { onToggled } = config || {}

  const { editor } = useTiptapEditor()
  const canToggle = canToggleDetails(editor)
  const isActive = editor?.isActive("details") || false

  const handleToggle = useCallback(() => {
    if (!editor) return false

    const success = toggleDetails(editor)
    if (success) {
      onToggled?.()
    }
    return success
  }, [editor, onToggled])

  return {
    isActive,
    handleToggle,
    canToggle,
    label: "Details",
    shortcutKeys: DETAILS_SHORTCUT_KEY,
    Icon: DetailsIcon,
  }
}
