"use client"

import type { Editor } from "@tiptap/react"
import { useCallback, useState } from "react"
import { CheckIcon, CopyIcon } from "@/components/tiptap-icons"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { tiptapMarkdownSerializer } from "./markdown-serializer"

export type CopyFormat = "html" | "text" | "markdown"

/**
 * Configuration for the copy functionality
 */
export interface UseCopyConfig {
  /**
   * The format to copy as
   */
  format: CopyFormat
  /**
   * Callback function called after a successful copy
   */
  onCopied?: () => void
  /**
   * Callback function called when copy fails
   */
  onError?: (error: Error) => void
}

/**
 * Gets the content from the editor in the specified format
 */
function getEditorContent(editor: Editor | null, format: CopyFormat): string {
  if (!editor) return ""

  if (format === "html") {
    return editor.getHTML()
  } else if (format === "markdown") {
    const { state } = editor
    return tiptapMarkdownSerializer.serialize(state.doc)
  } else {
    return editor.getText()
  }
}

/**
 * Custom hook that provides copy functionality for Tiptap editor
 */
export function useCopy(config: UseCopyConfig) {
  const { format, onCopied, onError } = config
  const { editor } = useTiptapEditor()
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!editor) return false

    try {
      const content = getEditorContent(editor, format)
      await navigator.clipboard.writeText(content)

      setIsCopied(true)
      onCopied?.()

      // Reset icon after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)

      return true
    } catch (error) {
      console.error("Failed to copy content:", error)
      onError?.(error instanceof Error ? error : new Error("Failed to copy"))
      return false
    }
  }, [editor, format, onCopied, onError])

  const label =
    format === "html"
      ? "Copy as HTML"
      : format === "markdown"
        ? "Copy as Markdown"
        : "Copy as Text"
  const Icon = isCopied ? CheckIcon : CopyIcon

  return {
    handleCopy,
    canCopy: !!editor,
    isCopied,
    label,
    Icon,
  }
}
