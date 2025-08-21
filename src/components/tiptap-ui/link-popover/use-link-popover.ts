"use client"

import type { Editor } from "@tiptap/react"
import { useCallback, useEffect, useState } from "react"

import { LinkIcon } from "@/components/tiptap-icons/link-icon"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { isMarkInSchema, sanitizeUrl } from "@/lib/tiptap-utils"

/**
 * Configuration for the link popover functionality
 */
export interface UseLinkPopoverConfig {
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void
}

/**
 * Configuration for the link handler functionality
 */
export interface LinkHandlerProps {
  /**
   * The Tiptap editor instance.
   */
  editor: Editor | null
  /**
   * Callback function called when the link is set.
   */
  onSetLink?: () => void
}

/**
 * Checks if a link can be set in the current editor state
 */
export function canSetLink(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.can().setMark("link")
}

/**
 * Checks if a link is currently active in the editor
 */
export function isLinkActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive("link")
}

/**
 * Determines if the link button should be shown
 */
export function shouldShowLinkButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  const linkInSchema = isMarkInSchema("link", editor)

  if (!linkInSchema || !editor) {
    return false
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canSetLink(editor)
  }

  return true
}

/**
 * Custom hook for handling link operations in a Tiptap editor
 */
export function useLinkHandler(props: LinkHandlerProps) {
  const { editor, onSetLink } = props
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!editor) return

    // Get URL immediately on mount
    const { href } = editor.getAttributes("link")

    if (isLinkActive(editor) && url === null) {
      setUrl(href || "")
    }
  }, [editor, url])

  useEffect(() => {
    if (!editor) return

    const updateLinkState = () => {
      const { href } = editor.getAttributes("link")
      setUrl(href || "")
    }

    editor.on("selectionUpdate", updateLinkState)
    return () => {
      editor.off("selectionUpdate", updateLinkState)
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (!url || !editor) return

    const { selection } = editor.state
    const isEmpty = selection.empty

    let chain = editor.chain().focus()

    chain = chain.extendMarkRange("link").setLink({ href: url })

    if (isEmpty) {
      chain = chain.insertContent({ type: "text", text: url })
    }

    chain.run()

    setUrl(null)

    onSetLink?.()
  }, [editor, onSetLink, url])

  const removeLink = useCallback(() => {
    if (!editor) return
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .unsetLink()
      .setMeta("preventAutolink", true)
      .run()
    setUrl("")
  }, [editor])

  const openLink = useCallback(
    (target: string = "_blank", features: string = "noopener,noreferrer") => {
      if (!url) return

      const safeUrl = sanitizeUrl(url, window.location.href)
      if (safeUrl !== "#") {
        window.open(safeUrl, target, features)
      }
    },
    [url],
  )

  return {
    url: url || "",
    setUrl,
    setLink,
    removeLink,
    openLink,
  }
}

/**
 * Main hook that provides link popover functionality for Tiptap editor
 */
export function useLinkPopover(config?: UseLinkPopoverConfig) {
  const { onSetLink } = config || {}

  const { editor } = useTiptapEditor()
  const canSet = canSetLink(editor)
  const isActive = isLinkActive(editor)

  const linkHandler = useLinkHandler({
    editor,
    onSetLink,
  })

  return {
    canSet,
    isActive,
    label: "Link",
    Icon: LinkIcon,
    ...linkHandler,
  }
}
