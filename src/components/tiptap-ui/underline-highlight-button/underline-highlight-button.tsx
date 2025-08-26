"use client"

import { HighlighterIcon } from "@/components/tiptap-icons"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { Button } from "@/components/tiptap-ui-primitive/button"

export interface UnderlineHighlightButtonProps {
  /**
   * The color of the highlight
   */
  color?: string
}

export function UnderlineHighlightButton({
  color = "#ffeb3b",
}: UnderlineHighlightButtonProps) {
  const { editor } = useTiptapEditor()

  if (!editor) return null

  const isActive = editor.isActive("underlineHighlight", { color })

  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="small"
      onClick={() => editor.chain().focus().toggleUnderlineHighlight({ color }).run()}
      disabled={!editor.can().chain().focus().toggleUnderlineHighlight().run()}
      aria-label={`Toggle underline highlight ${color}`}
      title={`Underline highlight (Cmd+Shift+H)`}
    >
      <HighlighterIcon className="size-4" />
    </Button>
  )
}