"use client"

// Import Tiptap node styles
import "@/components/tiptap-node/blockquote-node/blockquote-node.css"
import "@/components/tiptap-node/code-block-node/code-block-node.css"
import "@/components/tiptap-node/heading-node/heading-node.css"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.css"
import "@/components/tiptap-node/image-node/image-node.css"
import "@/components/tiptap-node/image-upload-node/image-upload-node.css"
import "@/components/tiptap-node/list-node/list-node.css"
import "@/components/tiptap-node/mathematics-node/mathematics-node.css"
import "@/components/tiptap-node/paragraph-node/paragraph-node.css"

import {
  Details,
  DetailsContent,
  DetailsSummary,
} from "@tiptap/extension-details"
import Emoji from "@tiptap/extension-emoji"
import FileHandler from "@tiptap/extension-file-handler"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import Mathematics from "@tiptap/extension-mathematics"
import Mention from "@tiptap/extension-mention"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import { TableKit } from "@tiptap/extension-table"
import TableOfContents from "@tiptap/extension-table-of-contents"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyleKit } from "@tiptap/extension-text-style"
import YouTube from "@tiptap/extension-youtube"
import {
  CharacterCount,
  Focus,
  Placeholder,
  Selection,
} from "@tiptap/extensions"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
// import InvisibleCharacters from "@tiptap/extension-invisible-characters"
import { FlexibleToolbar } from "@/app/_components/toolbar"
import HorizontalRule from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node"

export function Editor() {
  const editor = useEditor({
    extensions: [
      CharacterCount,
      Details.configure({
        persist: true,
      }),
      DetailsContent,
      DetailsSummary,
      Emoji,
      FileHandler,
      Focus,
      Highlight.configure({ multicolor: true }),
      HorizontalRule,
      Image,
      ImageUploadNode,
      // InvisibleCharacters,
      Mathematics,
      Mention,
      Placeholder,
      Selection,
      StarterKit,
      Subscript,
      Superscript,
      TableKit,
      TableOfContents,
      TextAlign,
      TextStyleKit,
      YouTube,
    ],
    immediatelyRender: false,
    injectCSS: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: "h-full outline-none prose",
      },
    },
    content: `
      <p>Hello World!</p>
    `,
  })

  return (
    <EditorContext value={{ editor }}>
      <div className="max-w-[90vw] md:max-w-[70vw] mt-16 md:mt-0 mx-auto w-full py-4 flex flex-col items-center gap-4">
        <FlexibleToolbar />
        <EditorContent editor={editor} className="w-full" />
      </div>
    </EditorContext>
  )
}
