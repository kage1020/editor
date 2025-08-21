"use client"

import { ImagePlusIcon } from "@/components/tiptap-icons/image-plus-icon"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { isExtensionAvailable, isNodeTypeSelected } from "@/lib/tiptap-utils"
import type { Editor } from "@tiptap/react"
import { useCallback } from "react"
import { useHotkeys } from "react-hotkeys-hook"

export const IMAGE_UPLOAD_SHORTCUT_KEY = "mod+shift+i"

/**
 * Configuration for the image upload functionality
 */
export interface UseImageUploadConfig {
  /**
   * Callback function called after a successful image insertion.
   */
  onInserted?: () => void
}

/**
 * Checks if image can be inserted in the current editor state
 */
export function canInsertImage(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isExtensionAvailable(editor, "imageUpload") ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false

  return editor.can().insertContent({ type: "imageUpload" })
}

/**
 * Checks if image is currently active
 */
export function isImageActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive("imageUpload")
}

/**
 * Inserts an image in the editor
 */
export function insertImage(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canInsertImage(editor)) return false

  try {
    return editor
      .chain()
      .focus()
      .insertContent({
        type: "imageUpload",
      })
      .run()
  } catch {
    return false
  }
}

/**
 * Determines if the image button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, "imageUpload")) return false

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canInsertImage(editor)
  }

  return true
}

/**
 * Custom hook that provides image functionality for Tiptap editor
 */
export function useImageUpload(config?: UseImageUploadConfig) {
  const { onInserted } = config || {}

  const { editor } = useTiptapEditor()
  const isMobile = useIsMobile()
  const canInsert = canInsertImage(editor)
  const isActive = isImageActive(editor)

  const handleImage = useCallback(() => {
    if (!editor) return false

    const success = insertImage(editor)
    if (success) {
      onInserted?.()
    }
    return success
  }, [editor, onInserted])

  useHotkeys(
    IMAGE_UPLOAD_SHORTCUT_KEY,
    (event) => {
      event.preventDefault()
      handleImage()
    },
    {
      enabled: canInsert,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    },
  )

  return {
    isActive,
    handleImage,
    canInsert,
    label: "Add image",
    shortcutKeys: IMAGE_UPLOAD_SHORTCUT_KEY,
    Icon: ImagePlusIcon,
  }
}
