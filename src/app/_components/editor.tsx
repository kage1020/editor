"use client"

import { FlexibleToolbar } from "@/app/_components/toolbar"
import HorizontalRule from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node"
import {
  Details,
  DetailsContent,
  DetailsSummary,
} from "@tiptap/extension-details"
import Emoji from "@tiptap/extension-emoji"
import FileHandler from "@tiptap/extension-file-handler"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import InvisibleCharacters from "@tiptap/extension-invisible-characters"
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
      Highlight,
      HorizontalRule,
      Image,
      ImageUploadNode,
      InvisibleCharacters,
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
      <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th colspan="3">Description</th>
            </tr>
            <tr>
              <td>Cyndi Lauper</td>
              <td>Singer</td>
              <td>Songwriter</td>
              <td>Actress</td>
            </tr>
          </tbody>
        </table>
    `,
  })

  return (
    <EditorContext value={{ editor }}>
      <div className="max-w-[90vw] md:max-w-[70vw] mx-auto w-full py-4 flex flex-col gap-4">
        <FlexibleToolbar />
        <EditorContent editor={editor} />
      </div>
    </EditorContext>
  )
}
