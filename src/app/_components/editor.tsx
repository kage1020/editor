"use client"

import { FlexibleToolbar } from "@/app/_components/toolbar"
import TextAlign from "@tiptap/extension-text-align"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

export function Editor() {
  const editor = useEditor({
    extensions: [StarterKit, TextAlign],
    immediatelyRender: false,
  })

  return (
    <EditorContext value={{ editor }}>
      <div>
        <FlexibleToolbar />
        <EditorContent editor={editor} />
      </div>
    </EditorContext>
  )
}
