import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover"
import { DetailsButton } from "@/components/tiptap-ui/details-button"
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { LinkPopover } from "@/components/tiptap-ui/link-popover"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TablePopover } from "@/components/tiptap-ui/table-popover"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

export function FlexibleToolbar() {
  return (
    <Toolbar>
      <ToolbarGroup>
        <BlockquoteButton />
        <CodeBlockButton />
        <HeadingDropdownMenu />
        <ImageUploadButton />
        <LinkPopover />
        <ListDropdownMenu />
        <DetailsButton />
        <TablePopover />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ColorHighlightPopover />
        <MarkButton type="bold" />
        <MarkButton type="code" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="subscript" />
        <MarkButton type="superscript" />
        <MarkButton type="underline" />
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
    </Toolbar>
  )
}
