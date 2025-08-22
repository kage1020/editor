import { MarkdownSerializer } from "prosemirror-markdown"

/**
 * Custom Markdown serializer that handles Tiptap extensions
 */
export const tiptapMarkdownSerializer = new MarkdownSerializer(
  {
    // Basic nodes from StarterKit
    blockquote(state, node) {
      state.wrapBlock("> ", null, node, () => state.renderContent(node))
    },
    code_block(state, node) {
      const lang = node.attrs.language || ""
      state.write(`\`\`\`${lang}\n`)
      state.text(node.textContent, false)
      state.ensureNewLine()
      state.write("```")
      state.closeBlock(node)
    },
    heading(state, node) {
      state.write(`${state.repeat("#", node.attrs.level)} `)
      state.renderInline(node)
      state.closeBlock(node)
    },
    horizontal_rule(state, node) {
      state.write(node.attrs.markup || "---")
      state.closeBlock(node)
    },
    bullet_list(state, node) {
      state.renderList(node, "  ", () => `${node.attrs.bullet || "*"} `)
    },
    ordered_list(state, node) {
      const start = node.attrs.start || 1
      const maxW = String(start + node.childCount - 1).length
      const space = state.repeat(" ", maxW + 2)
      state.renderList(node, space, (i) => {
        const nStr = String(start + i)
        return `${state.repeat(" ", maxW - nStr.length) + nStr}. `
      })
    },
    list_item(state, node) {
      state.renderContent(node)
    },
    paragraph(state, node) {
      state.renderInline(node)
      state.closeBlock(node)
    },

    // Tiptap extension nodes
    details(state, node) {
      // Convert details to HTML-like format for now
      state.write("<details>")
      state.renderContent(node)
      state.write("</details>")
      state.closeBlock(node)
    },
    detailsSummary(state, node) {
      state.write("<summary>")
      state.renderInline(node)
      state.write("</summary>")
      state.closeBlock(node)
    },
    detailsContent(state, node) {
      state.renderContent(node)
    },

    // Image node
    image(state, node) {
      const alt = state.esc(node.attrs.alt || "")
      const src = state.esc(node.attrs.src)
      const title = node.attrs.title ? ` "${state.esc(node.attrs.title)}"` : ""
      state.write(`![${alt}](${src}${title})`)
    },

    // Table nodes
    table(state, node) {
      let isFirstRow = true
      node.forEach((row, _, i) => {
        if (i > 0) state.ensureNewLine()

        // Render the row
        const cells: string[] = []
        row.forEach((cell, __, cellIndex) => {
          if (cellIndex > 0) cells.push(" | ")
          else cells.push("| ")

          // Capture cell content
          const cellContent = cell.textContent || ""
          cells.push(cellContent)
        })
        cells.push(" |")
        state.write(cells.join(""))

        // Add header separator after first row if it contains headers
        if (isFirstRow && row.firstChild?.type.name === "tableHeader") {
          state.ensureNewLine()
          const headerSeparator: string[] = []
          row.forEach((_cell, __, cellIndex) => {
            if (cellIndex > 0) headerSeparator.push(" | ")
            else headerSeparator.push("| ")
            headerSeparator.push("---")
          })
          headerSeparator.push(" |")
          state.write(headerSeparator.join(""))
        }
        isFirstRow = false
      })
      state.closeBlock(node)
    },
    tableRow(_state, _node) {
      // This will be handled by the table node above
    },
    tableCell(_state, _node) {
      // This will be handled by the table node above
    },
    tableHeader(_state, _node) {
      // This will be handled by the table node above
    },

    // Task list nodes
    taskList(state, node) {
      state.renderList(node, "  ", () => "- ")
    },
    taskItem(state, node) {
      const checked = node.attrs.checked ? "x" : " "
      state.write(`[${checked}] `)
      state.renderContent(node)
    },

    // Mathematics node - fallback to text
    mathematics(state, node) {
      const content = node.textContent
      if (node.attrs.display) {
        state.write(`$$\n${content}\n$$`)
        state.closeBlock(node)
      } else {
        state.write(`$${content}$`)
      }
    },

    // YouTube node - convert to link
    youtube(state, node) {
      const src = node.attrs.src
      state.write(`[YouTube Video](${src})`)
    },

    // Fallback for unsupported nodes
    text(state, node) {
      state.text(node.text || "")
    },

    // Hard break
    hard_break(state, _node, parent, index) {
      const br = "\n"
      if (index === parent.childCount - 1) return
      state.write(br)
    },
  },
  {
    // Marks
    em: { open: "*", close: "*" },
    strong: { open: "**", close: "**" },
    code: { open: "`", close: "`" },
    link: {
      open(_state, _mark, _parent, _index) {
        return "["
      },
      close(state, mark, _parent, _index) {
        const href = mark.attrs.href
        const title = mark.attrs.title
          ? ` "${state.esc(mark.attrs.title)}"`
          : ""
        return `](${state.esc(href)}${title})`
      },
    },

    // Highlight mark
    highlight: { open: "==", close: "==" },

    // Subscript and superscript
    subscript: { open: "~", close: "~" },
    superscript: { open: "^", close: "^" },

    // Text style marks
    textStyle: {
      open(_state, mark) {
        let open = ""
        if (mark.attrs.color) {
          open += `<span style="color: ${mark.attrs.color}">`
        }
        if (mark.attrs.backgroundColor) {
          open += `<span style="background-color: ${mark.attrs.backgroundColor}">`
        }
        return open
      },
      close(_state, mark) {
        let close = ""
        if (mark.attrs.backgroundColor) {
          close += "</span>"
        }
        if (mark.attrs.color) {
          close += "</span>"
        }
        return close
      },
    },
  },
)
