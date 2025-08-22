import { Extension } from "@tiptap/core"
import type { Node, Schema } from "@tiptap/pm/model"
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
} from "@/utils/markdown-parser"

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
    if (item.type === "task") {
      listItem = schema.nodes.taskItem.create(
        { checked: item.checked || false },
        schema.nodes.paragraph.create(
          {},
          item.content ? schema.text(item.content) : undefined,
        ),
      )
    } else {
      listItem = schema.nodes.listItem.create(
        {},
        schema.nodes.paragraph.create(
          {},
          item.content ? schema.text(item.content) : undefined,
        ),
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
    // No images, return text as paragraph
    return [schema.nodes.paragraph.create({}, schema.text(text))]
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
          if (para.trim()) {
            nodes.push(
              schema.nodes.paragraph.create({}, schema.text(para.trim())),
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

    // Wrap image in a paragraph for better editing experience
    nodes.push(
      schema.nodes.paragraph.create({}, [
        schema.nodes.image.create(imageAttrs),
      ]),
    )

    lastIndex = imageIndex + image.fullMatch.length
  }

  // Add remaining text after the last image
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex).trim()
    if (remainingText) {
      const paragraphs = remainingText.split(/\n\n+/)
      for (const para of paragraphs) {
        if (para.trim()) {
          nodes.push(
            schema.nodes.paragraph.create({}, schema.text(para.trim())),
          )
        }
      }
    }
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
    // No headings, return text as paragraph
    return [schema.nodes.paragraph.create({}, schema.text(text))]
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
          if (para.trim()) {
            nodes.push(
              schema.nodes.paragraph.create({}, schema.text(para.trim())),
            )
          }
        }
      }
    }

    // Add the heading node
    nodes.push(
      schema.nodes.heading.create(
        { level: heading.level },
        heading.content ? schema.text(heading.content) : undefined,
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
        if (para.trim()) {
          nodes.push(
            schema.nodes.paragraph.create({}, schema.text(para.trim())),
          )
        }
      }
    }
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
              try {
                const tableData = parseMarkdownTable(text)
                const tableNode = createTableFromMarkdown(
                  tableData,
                  view.state.schema,
                )

                // Insert the table at the current position
                const { from } = view.state.selection
                const tr = view.state.tr.replaceWith(from, from, tableNode)

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
                  const { from, to } = view.state.selection
                  let tr = view.state.tr

                  // Handle single list or multiple lists
                  if (Array.isArray(listNodes)) {
                    // Replace selection with first list, then insert others
                    tr = tr.replaceWith(from, to, listNodes[0])
                    let insertPos = from + listNodes[0].nodeSize

                    for (let i = 1; i < listNodes.length; i++) {
                      tr = tr.insert(insertPos, listNodes[i])
                      insertPos += listNodes[i].nodeSize
                    }
                  } else {
                    tr = tr.replaceWith(from, to, listNodes)
                  }

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
                  const { from, to } = view.state.selection
                  let tr = view.state.tr

                  // Replace selection with first node
                  tr = tr.replaceWith(from, to, contentNodes[0])
                  let insertPos = from + contentNodes[0].nodeSize

                  // Insert remaining nodes
                  for (let i = 1; i < contentNodes.length; i++) {
                    tr = tr.insert(insertPos, contentNodes[i])
                    insertPos += contentNodes[i].nodeSize
                  }

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
                  const { from, to } = view.state.selection
                  let tr = view.state.tr

                  // Replace selection with first node
                  tr = tr.replaceWith(from, to, contentNodes[0])
                  let insertPos = from + contentNodes[0].nodeSize

                  // Insert remaining nodes
                  for (let i = 1; i < contentNodes.length; i++) {
                    tr = tr.insert(insertPos, contentNodes[i])
                    insertPos += contentNodes[i].nodeSize
                  }

                  view.dispatch(tr)
                  return true
                }
              } catch (error) {
                console.error("Failed to parse markdown headings:", error)
                return false
              }
            }

            // For now, let other markdown content fall through to default handling
            // In the future, we could add full markdown parsing here
            return false
          },
        },
      }),
    ]
  },
})

export default MarkdownPaste
