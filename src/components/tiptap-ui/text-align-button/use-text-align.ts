"use client"

import { AlignCenterIcon } from "@/components/tiptap-icons/align-center-icon"
import { AlignJustifyIcon } from "@/components/tiptap-icons/align-justify-icon"
import { AlignLeftIcon } from "@/components/tiptap-icons/align-left-icon"
import { AlignRightIcon } from "@/components/tiptap-icons/align-right-icon"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { isExtensionAvailable, isNodeTypeSelected } from "@/lib/tiptap-utils"
import type { ChainedCommands, Editor } from "@tiptap/react"
import { useCallback } from "react"
import { useHotkeys } from "react-hotkeys-hook"

export type TextAlign = "left" | "center" | "right" | "justify"

/**
 * Configuration for the text align functionality
 */
export interface UseTextAlignConfig {
  /**
   * The text alignment to apply.
   */
  align: TextAlign
  /**
   * Callback function called after a successful alignment change.
   */
  onAligned?: () => void
}

export const TEXT_ALIGN_SHORTCUT_KEYS: Record<TextAlign, string> = {
  left: "mod+shift+l",
  center: "mod+shift+e",
  right: "mod+shift+r",
  justify: "mod+shift+j",
}

export const textAlignIcons = {
  left: AlignLeftIcon,
  center: AlignCenterIcon,
  right: AlignRightIcon,
  justify: AlignJustifyIcon,
}

export const textAlignLabels: Record<TextAlign, string> = {
  left: "Align left",
  center: "Align center",
  right: "Align right",
  justify: "Align justify",
}

/**
 * Checks if text alignment can be performed in the current editor state
 */
export function canSetTextAlign(
  editor: Editor | null,
  align: TextAlign,
): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isExtensionAvailable(editor, "textAlign") ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false

  return editor.can().setTextAlign(align)
}

export function hasSetTextAlign(
  commands: ChainedCommands,
): commands is ChainedCommands & {
  setTextAlign: (align: TextAlign) => ChainedCommands
} {
  return "setTextAlign" in commands
}

/**
 * Checks if the text alignment is currently active
 */
export function isTextAlignActive(
  editor: Editor | null,
  align: TextAlign,
): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive({ textAlign: align })
}

/**
 * Sets text alignment in the editor
 */
export function setTextAlign(editor: Editor | null, align: TextAlign): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canSetTextAlign(editor, align)) return false

  const chain = editor.chain().focus()
  if (hasSetTextAlign(chain)) {
    return chain.setTextAlign(align).run()
  }

  return false
}

/**
 * Determines if the text align button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  align: TextAlign
}): boolean {
  const { editor, hideWhenUnavailable, align } = props

  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, "textAlign")) return false

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canSetTextAlign(editor, align)
  }

  return true
}

/**
 * Custom hook that provides text align functionality for Tiptap editor
 */
export function useTextAlign(config: UseTextAlignConfig) {
  const { align, onAligned } = config

  const { editor } = useTiptapEditor()
  const isMobile = useIsMobile()
  const canAlign = canSetTextAlign(editor, align)
  const isActive = isTextAlignActive(editor, align)

  const handleTextAlign = useCallback(() => {
    if (!editor) return false

    const success = setTextAlign(editor, align)
    if (success) {
      onAligned?.()
    }
    return success
  }, [editor, align, onAligned])

  useHotkeys(
    TEXT_ALIGN_SHORTCUT_KEYS[align],
    (event) => {
      event.preventDefault()
      handleTextAlign()
    },
    {
      enabled: canAlign,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    },
  )

  return {
    isActive,
    handleTextAlign,
    canAlign,
    label: textAlignLabels[align],
    shortcutKeys: TEXT_ALIGN_SHORTCUT_KEYS[align],
    Icon: textAlignIcons[align],
  }
}
