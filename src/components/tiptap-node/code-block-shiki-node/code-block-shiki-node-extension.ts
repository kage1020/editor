import { CodeBlock, type CodeBlockOptions } from "@tiptap/extension-code-block"
import {
  mergeAttributes,
  nodeInputRule,
  nodePasteRule,
  ReactNodeViewRenderer,
} from "@tiptap/react"
import type { LanguageInput, ThemeInput } from "shiki"
import { CodeBlockShikiNode } from "./code-block-shiki-node"
import { createShikiPlugin, type ShikiPluginOptions } from "./shiki-plugin"

// Map of language aliases to their primary values
const languageAliases: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "shell",
  yml: "yaml",
  md: "markdown",
  rb: "ruby",
  rs: "rust",
  kt: "kotlin",
  docker: "dockerfile",
}

// Helper function to normalize language names
const normalizeLanguage = (lang: string | null | undefined): string => {
  if (!lang) return ""
  return languageAliases[lang] || lang
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    codeBlockShiki: {
      /**
       * Set a code block with Shiki highlighting
       */
      setCodeBlockShiki: (attributes?: {
        language?: string
        theme?: string
      }) => ReturnType
      /**
       * Toggle a code block with Shiki highlighting
       */
      toggleCodeBlockShiki: (attributes?: {
        language?: string
        theme?: string
      }) => ReturnType
    }
  }
}

export interface CodeBlockShikiOptions
  extends Omit<CodeBlockOptions, "defaultLanguage" | "defaultTheme"> {
  /**
   * Default language to use when no language is specified
   */
  defaultLanguage: LanguageInput | null
  /**
   * Default theme to use when no theme is specified
   */
  defaultTheme: ThemeInput | null
  /**
   * Shiki plugin options
   */
  shikiOptions?: Partial<ShikiPluginOptions>
}

export const CodeBlockShiki = CodeBlock.extend<CodeBlockShikiOptions>({
  name: "codeBlockShiki",

  group: "block",

  code: true,

  defining: true,

  addOptions() {
    return {
      ...this.parent?.(),
      defaultLanguage: null,
      defaultTheme: null,
      languageClassPrefix: "language-",
      exitOnTripleEnter: true,
      exitOnArrowDown: true,
      HTMLAttributes: {},
      shikiOptions: {},
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      theme: {
        default: "light-plus",
        parseHTML: (element) => element.getAttribute("data-theme"),
        renderHTML: (attributes) => {
          if (!attributes.theme) {
            return {}
          }
          return {
            "data-theme": attributes.theme,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full",
        getAttrs: (element) => {
          const code = element.querySelector("code")
          if (!code) return false
          return {
            language: normalizeLanguage(code.dataset.language) || "plaintext",
            theme: code.dataset.theme || "light-plus",
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "pre",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      [
        "code",
        {
          "data-language": HTMLAttributes.language,
          "data-theme": HTMLAttributes.theme,
        },
        0,
      ],
    ]
  },

  addCommands() {
    return {
      setCodeBlockShiki:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.setNode(this.name, {
            ...attributes,
            language: normalizeLanguage(attributes.language),
          })
        },
      toggleCodeBlockShiki:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, "paragraph", {
            ...attributes,
            language: normalizeLanguage(attributes.language),
          })
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-c": () => this.editor.commands.toggleCodeBlockShiki(),
    }
  },

  addInputRules() {
    return [
      // スペースをトリガーとして使用
      nodeInputRule({
        find: /(\n*```([a-zA-Z0-9]*) )$/,
        type: this.type,
        getAttributes: (match) => {
          return {
            language: normalizeLanguage(match[2]) || "plaintext",
            theme: this.options.defaultTheme || "light-plus",
          }
        },
      }),
    ]
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: /```(\w+)?\n([\s\S]*?)\n```/g,
        type: this.type,
        getAttributes: (match) => {
          return {
            language: normalizeLanguage(match[1]) || "plaintext",
            theme: this.options.defaultTheme || "light-plus",
          }
        },
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockShikiNode)
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() ?? []),
      createShikiPlugin(this.options.shikiOptions),
    ]
  },
})

export default CodeBlockShiki
