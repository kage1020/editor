import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover"
import { CopyDropdownMenu } from "@/components/tiptap-ui/copy-dropdown-menu"
import { DetailsButton } from "@/components/tiptap-ui/details-button"
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { LinkPopover } from "@/components/tiptap-ui/link-popover"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TablePopover } from "@/components/tiptap-ui/table-popover"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UnderlineHighlightPopover } from "@/components/tiptap-ui/underline-highlight-popover"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

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
        <UnderlineHighlightPopover />
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
        <CopyDropdownMenu />
      </ToolbarGroup>
    </Toolbar>
  )
}
