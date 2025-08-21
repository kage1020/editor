"use client"

import type { Editor } from "@tiptap/react"
import { useCallback } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { Redo2Icon, Undo2Icon } from "@/components/tiptap-icons"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { isNodeTypeSelected } from "@/lib/tiptap-utils"

type UndoRedoAction = "undo" | "redo"

/**
 * Configuration for the history functionality
 */
export interface UseUndoRedoConfig {
  /**
   * The history action to perform (undo or redo).
   */
  action: UndoRedoAction
  /**
   * Callback function called after a successful action execution.
   */
  onExecuted?: () => void
}

const UNDO_REDO_SHORTCUT_KEYS: Record<UndoRedoAction, string> = {
  undo: "mod+z",
  redo: "mod+shift+z",
}

const historyActionLabels: Record<UndoRedoAction, string> = {
  undo: "Undo",
  redo: "Redo",
}

const historyIcons = {
  undo: Undo2Icon,
  redo: Redo2Icon,
}

/**
 * Checks if a history action can be executed
 */
function canExecuteUndoRedoAction(
  editor: Editor | null,
  action: UndoRedoAction,
): boolean {
  if (!editor || !editor.isEditable) return false
  if (isNodeTypeSelected(editor, ["image"])) return false

  return action === "undo" ? editor.can().undo() : editor.can().redo()
}

/**
 * Executes a history action on the editor
 */
function executeUndoRedoAction(
  editor: Editor | null,
  action: UndoRedoAction,
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canExecuteUndoRedoAction(editor, action)) return false

  const chain = editor.chain().focus()
  return action === "undo" ? chain.undo().run() : chain.redo().run()
}

/**
 * Custom hook that provides history functionality for Tiptap editor
 */
export function useUndoRedo(config: UseUndoRedoConfig) {
  const { action, onExecuted } = config

  const { editor } = useTiptapEditor()
  const isMobile = useIsMobile()
  const canExecute = canExecuteUndoRedoAction(editor, action)

  const handleAction = useCallback(() => {
    if (!editor) return false

    const success = executeUndoRedoAction(editor, action)
    if (success) {
      onExecuted?.()
    }
    return success
  }, [editor, action, onExecuted])

  useHotkeys(
    UNDO_REDO_SHORTCUT_KEYS[action],
    (event) => {
      event.preventDefault()
      handleAction()
    },
    {
      enabled: canExecute,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    },
  )

  return {
    handleAction,
    canExecute,
    label: historyActionLabels[action],
    shortcutKeys: UNDO_REDO_SHORTCUT_KEYS[action],
    Icon: historyIcons[action],
  }
}
