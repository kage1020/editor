"use client"

import { use, useState } from "react"

// Import Tiptap node styles
import "@/components/tiptap-node/blockquote-node/blockquote-node.css"
import "@/components/tiptap-node/code-block-node/code-block-node.css"
import "@/components/tiptap-node/details-node/details-node.css"
import "@/components/tiptap-node/heading-node/heading-node.css"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.css"
import "@/components/tiptap-node/image-node/image-node.css"
import "@/components/tiptap-node/table-node/table-node.css"
import "@/components/tiptap-node/image-upload-node/image-upload-node.css"
import "@/components/tiptap-node/list-node/list-node.css"
import "@/components/tiptap-node/mathematics-node/mathematics-node.css"
import "@/components/tiptap-node/paragraph-node/paragraph-node.css"
import "@/components/tiptap-extension/underline-highlight/underline-highlight.css"
import "katex/dist/katex.min.css"

import { DetailsContent, DetailsSummary } from "@tiptap/extension-details"
import Emoji from "@tiptap/extension-emoji"
import Image from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
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
import { toast } from "sonner"
import { Highlight } from "@/components/tiptap-extension/highlight"
import { ImagePaste } from "@/components/tiptap-extension/image-paste"
import { MarkdownPaste } from "@/components/tiptap-extension/markdown-paste"
import { UnderlineHighlight } from "@/components/tiptap-extension/underline-highlight"
import { CodeBlockShiki } from "@/components/tiptap-node/code-block-shiki-node"
import { Details } from "@/components/tiptap-node/details-node/details-node-extension"
import HorizontalRule from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node"
import type { DocumentBody } from "@/db/queries"
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/image-file"
import { uploadImage } from "@/lib/upload-image"
import { Title } from "./title"
// import InvisibleCharacters from "@tiptap/extension-invisible-characters"
import { FlexibleToolbar } from "./toolbar"

interface EditorProps {
  documentPromise: Promise<DocumentBody | null>
}

export function Editor({ documentPromise }: EditorProps) {
  // Use React's use hook to resolve the promise
  const doc = use(documentPromise)
  const [title, setTitle] = useState(doc?.title || "Untitled")

  const editor = useEditor({
    extensions: [
      CharacterCount,
      CodeBlockShiki,
      Details.configure({
        persist: true,
      }),
      DetailsContent,
      DetailsSummary,
      Emoji,
      Focus,
      Highlight.configure({ multicolor: true }),
      HorizontalRule,
      Image.configure({
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
      ImagePaste,
      ImageUploadNode.configure({
        accept: IMAGE_TYPES.join(","),
        maxSize: MAX_IMAGE_BYTES,
        upload: uploadImage,
        onError: (error) => toast.error(error.message),
      }),
      // InvisibleCharacters,
      MarkdownPaste.configure({
        enableTablePaste: true,
        enableListPaste: true,
        enableImagePaste: true,
        enableHeadingPaste: true,
        enableMarkdownPaste: true,
      }),
      Mathematics,
      Mention,
      Placeholder,
      Selection,
      StarterKit.configure({
        codeBlock: false,
        horizontalRule: false,
      }),
      Subscript,
      Superscript,
      TableKit.configure({
        table: { resizable: true, allowTableNodeSelection: true },
      }),
      TableOfContents,
      TaskItem.configure({
        nested: true,
      }),
      TaskList,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyleKit,
      UnderlineHighlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "underline-highlight",
        },
      }),
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
    content: doc?.content || ``,
  })

  return (
    <EditorContext value={{ editor }}>
      <div className="max-w-[90vw] md:max-w-[70vw] mt-16 md:mt-0 mx-auto w-full pt-4 pb-11 md:pb-4 flex flex-col items-center gap-4">
        <FlexibleToolbar title={title} />
        <Title title={title} onChange={setTitle} className="mb-4" />
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
    </EditorContext>
  )
}
