import HighlightBase from "@tiptap/extension-highlight"

/**
 * Custom Highlight extension that persists the color attributes.
 */
export const Highlight = HighlightBase.extend({
  parseHTML() {
    return [
      {
        tag: "mark",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false

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
})

export default Highlight
