"use client"

import { BlockquoteIcon } from "@/components/tiptap-icons/blockquote-icon"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import {
  findNodePosition,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
} from "@/lib/tiptap-utils"
import { NodeSelection, TextSelection } from "@tiptap/pm/state"
import type { Editor } from "@tiptap/react"
import { useCallback } from "react"
import { useHotkeys } from "react-hotkeys-hook"

export const BLOCKQUOTE_SHORTCUT_KEY = "mod+shift+b"

/**
 * Configuration for the blockquote functionality
 */
export interface UseBlockquoteConfig {
  /**
   * Callback function called after a successful toggle.
   */
  onToggled?: () => void
}

/**
 * Checks if blockquote can be toggled in the current editor state
 */
export function canToggleBlockquote(
  editor: Editor | null,
  turnInto: boolean = true,
): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isNodeInSchema("blockquote", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false

  if (!turnInto) {
    return editor.can().toggleWrap("blockquote")
  }

  try {
    const view = editor.view
    const state = view.state
    const selection = state.selection

    if (selection.empty || selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos
      if (!isValidPosition(pos)) return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Toggles blockquote formatting for a specific node or the current selection
 */
export function toggleBlockquote(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canToggleBlockquote(editor)) return false

  try {
    const view = editor.view
    let state = view.state
    let tr = state.tr

    // No selection, find the the cursor position
    if (state.selection.empty || state.selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos
      if (!isValidPosition(pos)) return false

      tr = tr.setSelection(NodeSelection.create(state.doc, pos))
      view.dispatch(tr)
      state = view.state
    }

    const selection = state.selection

    let chain = editor.chain().focus()

    // Handle NodeSelection
    if (selection instanceof NodeSelection) {
      const firstChild = selection.node.firstChild?.firstChild
      const lastChild = selection.node.lastChild?.lastChild

      const from = firstChild
        ? selection.from + firstChild.nodeSize
        : selection.from + 1

      const to = lastChild
        ? selection.to - lastChild.nodeSize
        : selection.to - 1

      chain = chain.setTextSelection({ from, to }).clearNodes()
    }

    const toggle = editor.isActive("blockquote")
      ? chain.lift("blockquote")
      : chain.wrapIn("blockquote")

    toggle.run()

    editor.chain().focus().selectTextblockEnd().run()

    return true
  } catch {
    return false
  }
}

/**
 * Determines if the blockquote button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isNodeInSchema("blockquote", editor)) return false

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleBlockquote(editor)
  }

  return true
}

/**
 * Custom hook that provides blockquote functionality for Tiptap editor
 */
export function useBlockquote(config?: UseBlockquoteConfig) {
  const { onToggled } = config || {}

  const { editor } = useTiptapEditor()
  const isMobile = useIsMobile()
  const canToggle = canToggleBlockquote(editor)
  const isActive = editor?.isActive("blockquote") || false

  const handleToggle = useCallback(() => {
    if (!editor) return false

    const success = toggleBlockquote(editor)
    if (success) {
      onToggled?.()
    }
    return success
  }, [editor, onToggled])

  useHotkeys(
    BLOCKQUOTE_SHORTCUT_KEY,
    (event) => {
      event.preventDefault()
      handleToggle()
    },
    {
      enabled: canToggle,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    },
  )

  return {
    isActive,
    handleToggle,
    canToggle,
    label: "Blockquote",
    shortcutKeys: BLOCKQUOTE_SHORTCUT_KEY,
    Icon: BlockquoteIcon,
  }
}
