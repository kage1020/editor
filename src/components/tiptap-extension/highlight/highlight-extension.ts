import { mergeAttributes } from "@tiptap/core"
import HighlightBase from "@tiptap/extension-highlight"

/**
 * Custom Highlight extension that persists the color attributes.
 */
export const Highlight = HighlightBase.extend({
  addAttributes() {
    if (!this.options.multicolor) {
      return {}
    }

    return {
      color: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-color") || element.style.backgroundColor,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {}
          }

          return {
            "data-color": attributes.color,
            style: `background-color: ${attributes.color}; color: inherit`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "mark",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false

          // Only match marks with the "highlight" class
          if (!element.classList.contains("highlight")) return false

          // Check if this is a highlight mark (has data-color attribute or backgroundColor style)
          const hasHighlight =
            element.hasAttribute("data-color") || element.style.backgroundColor

          if (!hasHighlight) return false

          // When multicolor is enabled, extract the color attribute
          if (this.options.multicolor) {
            const color =
              element.getAttribute("data-color") ||
              element.style.backgroundColor
            return color ? { color } : {}
          }

          // If multicolor is not enabled, just match the mark without attributes
          return {}
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "mark",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "highlight",
      }),
      0,
    ]
  },
})

export default Highlight
