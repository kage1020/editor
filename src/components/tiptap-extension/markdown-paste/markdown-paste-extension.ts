import { Extension } from "@tiptap/core"
import type { Node, Schema } from "@tiptap/pm/model"
import { Fragment, Slice } from "@tiptap/pm/model"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import {
  hasMarkdownHeadings,
  hasMarkdownImages,
  isMarkdownList,
  isMarkdownTable,
  parseMarkdownHeadings,
  parseMarkdownImages,
  parseMarkdownList,
  parseMarkdownTable,
} from "./markdown-parser"

export interface MarkdownPasteOptions {
  /**
   * Whether to enable markdown table paste
   */
  enableTablePaste: boolean
  /**
   * Whether to enable markdown list paste
   */
  enableListPaste: boolean
  /**
   * Whether to enable markdown image paste
   */
  enableImagePaste: boolean
  /**
   * Whether to enable markdown heading paste
   */
  enableHeadingPaste: boolean
  /**
   * Whether to enable general markdown paste
   */
  enableMarkdownPaste: boolean
}

/**
 * Create a table node from parsed markdown table data
 */
function createTableFromMarkdown(
  tableData: ReturnType<typeof parseMarkdownTable>,
  schema: Schema,
) {
  const { headers, rows, columnCount } = tableData

  // Create header row
  const headerCells = headers.map((headerText) =>
    schema.nodes.tableHeader.create(
      {},
      headerText ? schema.text(headerText) : undefined,
    ),
  )

  // Ensure we have the right number of header cells
  while (headerCells.length < columnCount) {
    headerCells.push(schema.nodes.tableHeader.create())
  }

  const headerRow = schema.nodes.tableRow.create({}, headerCells)

  // Create data rows
  const dataRows = rows.map((rowData) => {
    const cells = rowData.map((cellText) =>
      schema.nodes.tableCell.create(
        {},
        cellText ? schema.text(cellText) : undefined,
      ),
    )

    // Ensure we have the right number of cells
    while (cells.length < columnCount) {
      cells.push(schema.nodes.tableCell.create())
    }

    return schema.nodes.tableRow.create({}, cells)
  })

  // Create table with header and data rows
  const allRows = [headerRow, ...dataRows]
  return schema.nodes.table.create({}, allRows)
}

/**
 * Create list nodes from parsed markdown list data
 */
function createListFromMarkdown(
  listData: ReturnType<typeof parseMarkdownList>,
  schema: Schema,
) {
  if (listData.length === 0) return null

  // Group items by type to create appropriate list structures
  const fragments: Node[] = []
  let currentListItems: Node[] = []
  let currentType: string | null = null

  for (const item of listData) {
    // If type changed, finalize current list and start new one
    if (item.type !== currentType) {
      if (currentListItems.length > 0 && currentType) {
        // Create list node with accumulated items
        let listNode: Node
        if (currentType === "task") {
          listNode = schema.nodes.taskList.create({}, currentListItems)
        } else if (currentType === "ordered") {
          listNode = schema.nodes.orderedList.create({}, currentListItems)
        } else {
          listNode = schema.nodes.bulletList.create({}, currentListItems)
        }
        fragments.push(listNode)
      }

      currentListItems = []
      currentType = item.type
    }

    // Create list item
    let listItem: Node
    const itemContent = item.content ? item.content.trim() : ""
    if (item.type === "task") {
      listItem = schema.nodes.taskItem.create(
        { checked: item.checked || false },
        itemContent
          ? schema.nodes.paragraph.create({}, schema.text(itemContent))
          : schema.nodes.paragraph.create(),
      )
    } else {
      listItem = schema.nodes.listItem.create(
        {},
        itemContent
          ? schema.nodes.paragraph.create({}, schema.text(itemContent))
          : schema.nodes.paragraph.create(),
      )
    }

    currentListItems.push(listItem)
  }

  // Handle remaining items
  if (currentListItems.length > 0 && currentType) {
    let listNode: Node
    if (currentType === "task") {
      listNode = schema.nodes.taskList.create({}, currentListItems)
    } else if (currentType === "ordered") {
      listNode = schema.nodes.orderedList.create({}, currentListItems)
    } else {
      listNode = schema.nodes.bulletList.create({}, currentListItems)
    }
    fragments.push(listNode)
  }

  return fragments.length === 1 ? fragments[0] : fragments
}

/**
 * Create image nodes from parsed markdown images and replace them in text
 */
function createContentWithImages(
  text: string,
  images: ReturnType<typeof parseMarkdownImages>,
  schema: Schema,
): Node[] {
  if (images.length === 0) {
    // No images, return text as paragraph (handle empty text)
    const trimmedText = text.trim()
    if (!trimmedText) {
      return [schema.nodes.paragraph.create()]
    }
    return [schema.nodes.paragraph.create({}, schema.text(trimmedText))]
  }

  const nodes: Node[] = []
  let lastIndex = 0

  // Sort images by their position in the text
  const sortedImages = [...images].sort(
    (a, b) => text.indexOf(a.fullMatch) - text.indexOf(b.fullMatch),
  )

  for (const image of sortedImages) {
    const imageIndex = text.indexOf(image.fullMatch, lastIndex)

    if (imageIndex === -1) continue

    // Add text before the image
    if (imageIndex > lastIndex) {
      const beforeText = text.substring(lastIndex, imageIndex).trim()
      if (beforeText) {
        // Split by newlines to create separate paragraphs
        const paragraphs = beforeText.split(/\n\n+/)
        for (const para of paragraphs) {
          const trimmedPara = para.trim()
          if (trimmedPara) {
            nodes.push(
              schema.nodes.paragraph.create({}, schema.text(trimmedPara)),
            )
          }
        }
      }
    }

    // Add the image node
    const imageAttrs: Record<string, string | null> = {
      src: image.src,
      alt: image.alt || null,
    }
    if (image.title) {
      imageAttrs.title = image.title
    }

    // Create image node directly without paragraph wrapper to avoid content validation issues
    nodes.push(schema.nodes.image.create(imageAttrs))

    lastIndex = imageIndex + image.fullMatch.length
  }

  // Add remaining text after the last image
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex).trim()
    if (remainingText) {
      const paragraphs = remainingText.split(/\n\n+/)
      for (const para of paragraphs) {
        const trimmedPara = para.trim()
        if (trimmedPara) {
          nodes.push(
            schema.nodes.paragraph.create({}, schema.text(trimmedPara)),
          )
        }
      }
    }
  }

  // Ensure we always return at least one node, and add trailing paragraph for editing after images
  if (nodes.length === 0) {
    nodes.push(schema.nodes.paragraph.create())
  } else {
    // Always add an empty paragraph at the end for better editing experience after images
    nodes.push(schema.nodes.paragraph.create())
  }

  return nodes
}

/**
 * Create content with headings from parsed markdown headings
 */
function createContentWithHeadings(
  text: string,
  headings: ReturnType<typeof parseMarkdownHeadings>,
  schema: Schema,
): Node[] {
  if (headings.length === 0) {
    // No headings, return text as paragraph (handle empty text)
    const trimmedText = text.trim()
    if (!trimmedText) {
      return [schema.nodes.paragraph.create()]
    }
    return [schema.nodes.paragraph.create({}, schema.text(trimmedText))]
  }

  const nodes: Node[] = []
  let lastIndex = 0

  // Sort headings by their position in the text
  const sortedHeadings = [...headings].sort(
    (a, b) => text.indexOf(a.fullMatch) - text.indexOf(b.fullMatch),
  )

  for (const heading of sortedHeadings) {
    const headingIndex = text.indexOf(heading.fullMatch, lastIndex)

    if (headingIndex === -1) continue

    // Add text before the heading
    if (headingIndex > lastIndex) {
      const beforeText = text.substring(lastIndex, headingIndex).trim()
      if (beforeText) {
        // Split by newlines to create separate paragraphs
        const paragraphs = beforeText.split(/\n\n+/)
        for (const para of paragraphs) {
          const trimmedPara = para.trim()
          if (trimmedPara) {
            nodes.push(
              schema.nodes.paragraph.create({}, schema.text(trimmedPara)),
            )
          }
        }
      }
    }

    // Add the heading node
    const headingContent = heading.content ? heading.content.trim() : ""
    nodes.push(
      schema.nodes.heading.create(
        { level: heading.level },
        headingContent ? schema.text(headingContent) : undefined,
      ),
    )

    lastIndex = headingIndex + heading.fullMatch.length
  }

  // Add remaining text after the last heading
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex).trim()
    if (remainingText) {
      const paragraphs = remainingText.split(/\n\n+/)
      for (const para of paragraphs) {
        const trimmedPara = para.trim()
        if (trimmedPara) {
          nodes.push(
            schema.nodes.paragraph.create({}, schema.text(trimmedPara)),
          )
        }
      }
    }
  }

  // Ensure we always return at least one node
  if (nodes.length === 0) {
    nodes.push(schema.nodes.paragraph.create())
  }

  return nodes
}

export const MarkdownPaste = Extension.create<MarkdownPasteOptions>({
  name: "markdownPaste",

  addOptions() {
    return {
      enableTablePaste: true,
      enableListPaste: true,
      enableImagePaste: true,
      enableHeadingPaste: true,
      enableMarkdownPaste: true,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("markdownPaste"),

        props: {
          handlePaste: (view, event, _slice) => {
            if (
              !this.options.enableTablePaste &&
              !this.options.enableListPaste &&
              !this.options.enableImagePaste &&
              !this.options.enableHeadingPaste &&
              !this.options.enableMarkdownPaste
            ) {
              return false
            }

            // Get clipboard data
            const clipboardData = event.clipboardData
            if (!clipboardData) return false

            const text = clipboardData.getData("text/plain")
            if (!text) return false

            // Handle markdown table paste
            if (this.options.enableTablePaste && isMarkdownTable(text)) {
              console.log("Processing as table")
              try {
                const tableData = parseMarkdownTable(text)
                const tableNode = createTableFromMarkdown(
                  tableData,
                  view.state.schema,
                )

                // Replace the current selection with the table
                const tr = view.state.tr.replaceSelectionWith(tableNode)

                view.dispatch(tr)
                return true
              } catch (error) {
                console.error("Failed to parse markdown table:", error)
                return false
              }
            }

            // Handle markdown list paste
            if (this.options.enableListPaste && isMarkdownList(text)) {
              try {
                const listData = parseMarkdownList(text)
                const listNodes = createListFromMarkdown(
                  listData,
                  view.state.schema,
                )

                if (listNodes) {
                  // Create a fragment and use replaceSelection with slice
                  const nodesArray = Array.isArray(listNodes)
                    ? listNodes
                    : [listNodes]
                  const fragment = Fragment.from(nodesArray)
                  const slice = new Slice(fragment, 0, 0)

                  const tr = view.state.tr.replaceSelection(slice)

                  view.dispatch(tr)
                  return true
                }
              } catch (error) {
                console.error("Failed to parse markdown list:", error)
                return false
              }
            }

            // Handle markdown image paste
            if (this.options.enableImagePaste && hasMarkdownImages(text)) {
              try {
                const images = parseMarkdownImages(text)
                const contentNodes = createContentWithImages(
                  text,
                  images,
                  view.state.schema,
                )

                if (contentNodes.length > 0) {
                  // Create a fragment and use replaceSelection with slice
                  const fragment = Fragment.from(contentNodes)
                  const slice = new Slice(fragment, 0, 0)

                  const tr = view.state.tr.replaceSelection(slice)

                  view.dispatch(tr)
                  return true
                }
              } catch (error) {
                console.error("Failed to parse markdown images:", error)
                return false
              }
            }

            // Handle markdown heading paste
            if (this.options.enableHeadingPaste && hasMarkdownHeadings(text)) {
              try {
                const headings = parseMarkdownHeadings(text)
                const contentNodes = createContentWithHeadings(
                  text,
                  headings,
                  view.state.schema,
                )

                if (contentNodes.length > 0) {
                  // Create a fragment and use replaceSelection with slice
                  const fragment = Fragment.from(contentNodes)
                  const slice = new Slice(fragment, 0, 0)

                  const tr = view.state.tr.replaceSelection(slice)

                  view.dispatch(tr)
                  return true
                }
              } catch (error) {
                console.error("Failed to parse markdown headings:", error)
                return false
              }
            }

            return false
          },
        },
      }),
    ]
  },
})

export default MarkdownPaste
