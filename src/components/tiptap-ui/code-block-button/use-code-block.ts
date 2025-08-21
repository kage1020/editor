"use client"

import { CodeBlockIcon } from "@/components/tiptap-icons/code-block-icon"
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

export const CODE_BLOCK_SHORTCUT_KEY = "mod+alt+c"

/**
 * Configuration for the code block functionality
 */
export interface UseCodeBlockConfig {
  /**
   * Callback function called after a successful code block toggle.
   */
  onToggled?: () => void
}

/**
 * Checks if code block can be toggled in the current editor state
 */
export function canToggle(
  editor: Editor | null,
  turnInto: boolean = true,
): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isNodeInSchema("codeBlock", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false

  if (!turnInto) {
    return editor.can().toggleNode("codeBlock", "paragraph")
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
 * Toggles code block in the editor
 */
export function toggleCodeBlock(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canToggle(editor)) return false

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

    const toggle = editor.isActive("codeBlock")
      ? chain.setNode("paragraph")
      : chain.toggleNode("codeBlock", "paragraph")

    toggle.run()

    editor.chain().focus().selectTextblockEnd().run()

    return true
  } catch {
    return false
  }
}

/**
 * Determines if the code block button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isNodeInSchema("codeBlock", editor)) return false

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggle(editor)
  }

  return true
}

/**
 * Custom hook that provides code block functionality for Tiptap editor
 */
export function useCodeBlock(config?: UseCodeBlockConfig) {
  const { onToggled } = config || {}

  const { editor } = useTiptapEditor()
  const isMobile = useIsMobile()
  const canToggleState = canToggle(editor)
  const isActive = editor?.isActive("codeBlock") || false

  const handleToggle = useCallback(() => {
    if (!editor) return false

    const success = toggleCodeBlock(editor)
    if (success) {
      onToggled?.()
    }
    return success
  }, [editor, onToggled])

  useHotkeys(
    CODE_BLOCK_SHORTCUT_KEY,
    (event) => {
      event.preventDefault()
      handleToggle()
    },
    {
      enabled: canToggleState,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    },
  )

  return {
    isActive,
    handleToggle,
    canToggle: canToggleState,
    label: "Code Block",
    shortcutKeys: CODE_BLOCK_SHORTCUT_KEY,
    Icon: CodeBlockIcon,
  }
}
