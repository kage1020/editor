"use client"

import { NodeSelection, TextSelection } from "@tiptap/pm/state"
import type { Editor } from "@tiptap/react"
import { useCallback, useEffect, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { DetailsIcon } from "@/components/tiptap-icons/details-icon"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import {
  findNodePosition,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
} from "@/lib/tiptap-utils"

export const DETAILS_SHORTCUT_KEY = "mod+shift+d"

/**
 * Configuration for the details functionality
 */
export interface UseDetailsConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when details is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful toggle.
   */
  onToggled?: () => void
}

/**
 * Checks if details can be toggled in the current editor state
 */
export function canToggleDetails(
  editor: Editor | null,
  turnInto: boolean = true,
): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isNodeInSchema("details", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false

  if (!turnInto) {
    return editor.can().toggleWrap("details")
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
 * Toggles details formatting for a specific node or the current selection
 */
export function toggleDetails(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canToggleDetails(editor)) return false

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

    const toggle = editor.isActive("details")
      ? chain.lift("details")
      : chain.wrapIn("details")

    toggle.run()

    editor.chain().focus().selectTextblockEnd().run()

    return true
  } catch {
    return false
  }
}

/**
 * Determines if the details button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isNodeInSchema("details", editor)) return false

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleDetails(editor)
  }

  return true
}

/**
 * Custom hook that provides details functionality for Tiptap editor
 */
export function useDetails(config?: UseDetailsConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onToggled,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const canToggle = canToggleDetails(editor)
  const isActive = editor?.isActive("details") || false

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }))
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleToggle = useCallback(() => {
    if (!editor) return false

    const success = toggleDetails(editor)
    if (success) {
      onToggled?.()
    }
    return success
  }, [editor, onToggled])

  useHotkeys(
    DETAILS_SHORTCUT_KEY,
    (event) => {
      event.preventDefault()
      handleToggle()
    },
    {
      enabled: isVisible && canToggle,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    },
  )

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: "Details",
    shortcutKeys: DETAILS_SHORTCUT_KEY,
    Icon: DetailsIcon,
  }
}
