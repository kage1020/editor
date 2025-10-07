import { Mark, mergeAttributes } from "@tiptap/core"

export interface UnderlineHighlightOptions {
  /**
   * HTML attributes to add to the generated highlight mark.
   */
  HTMLAttributes: Record<string, string | number | boolean>
  /**
   * Whether to allow multicolor highlights
   */
  multicolor: boolean
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    underlineHighlight: {
      /**
       * Set an underline highlight mark
       */
      setUnderlineHighlight: (attributes?: { color?: string }) => ReturnType
      /**
       * Toggle an underline highlight mark
       */
      toggleUnderlineHighlight: (attributes?: { color?: string }) => ReturnType
      /**
       * Unset an underline highlight mark
       */
      unsetUnderlineHighlight: () => ReturnType
    }
  }
}

/**
 * This extension allows you to create underline highlights (like a fluorescent marker)
 * that appear below the text instead of as a background color.
 */
export const UnderlineHighlight = Mark.create<UnderlineHighlightOptions>({
  name: "underlineHighlight",

  keepOnSplit: false,

  addOptions() {
    return {
      multicolor: false,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    if (!this.options.multicolor) {
      return {}
    }

    return {
      color: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-color") || element.style.borderBottomColor,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {}
          }

          return {
            "data-color": attributes.color,
            style: `border-bottom-color: ${attributes.color}`,
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
          const hasUnderlineHighlight =
            element instanceof HTMLElement &&
            element.classList.contains("underline-highlight")

          if (!hasUnderlineHighlight) return false

          // When multicolor is enabled, extract the color attribute
          if (this.options.multicolor && element instanceof HTMLElement) {
            const color =
              element.getAttribute("data-color") ||
              element.style.borderBottomColor
            return color ? { color } : {}
          }

          return {}
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "mark",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "underline-highlight",
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setUnderlineHighlight:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      toggleUnderlineHighlight:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes)
        },
      unsetUnderlineHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-h": () => this.editor.commands.toggleUnderlineHighlight(),
    }
  },
})

export default UnderlineHighlight
