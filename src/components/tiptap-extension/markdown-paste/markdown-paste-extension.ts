import { Extension } from "@tiptap/core"
import type { Schema } from "@tiptap/pm/model"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { isMarkdownTable, parseMarkdownTable } from "@/utils/markdown-parser"

export interface MarkdownPasteOptions {
  /**
   * Whether to enable markdown table paste
   */
  enableTablePaste: boolean
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

export const MarkdownPaste = Extension.create<MarkdownPasteOptions>({
  name: "markdownPaste",

  addOptions() {
    return {
      enableTablePaste: true,
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
