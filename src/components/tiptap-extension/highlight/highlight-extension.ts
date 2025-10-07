import Highlight from "@tiptap/extension-highlight"

/**
 * Custom Highlight extension that fixes the color persistence issue.
 *
 * This extension extends the built-in TipTap Highlight extension and fixes
 * the bug where highlight colors are not persisted after saving and reloading.
 *
 * The fix ensures that when HTML with color attributes is parsed, the color
 * is properly extracted and stored in the document's JSON representation.
 */
export const HighlightExtension = Highlight.extend({
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

export default HighlightExtension
