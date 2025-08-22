import type { Node } from "@tiptap/pm/model"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import {
  type BundledLanguage,
  type BundledTheme,
  createHighlighter,
  type Highlighter,
} from "shiki"

export interface ShikiPluginOptions {
  /**
   * Languages to load
   */
  languages: BundledLanguage[]
  /**
   * Themes to load
   */
  themes: BundledTheme[]
}

const defaultOptions: ShikiPluginOptions = {
  languages: [
    "javascript",
    "typescript",
    "html",
    "css",
    "json",
    "python",
    "bash",
    "sql",
    "yaml",
    "markdown",
    "java",
    "cpp",
    "c",
    "php",
    "ruby",
    "go",
    "rust",
    "swift",
    "kotlin",
    "scala",
    "dockerfile",
    "xml",
    "vue",
    "svelte",
  ],
  themes: ["light-plus", "dark-plus"],
}

export const shikiPluginKey = new PluginKey("shiki")

// Language mappings for shiki
const languageMapping: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  html: "html",
  css: "css",
  scss: "scss",
  sass: "sass",
  json: "json",
  py: "python",
  python: "python",
  sh: "bash",
  bash: "bash",
  shell: "bash",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  markdown: "markdown",
  java: "java",
  cpp: "cpp",
  c: "c",
  php: "php",
  rb: "ruby",
  ruby: "ruby",
  go: "go",
  rs: "rust",
  rust: "rust",
  swift: "swift",
  kt: "kotlin",
  kotlin: "kotlin",
  scala: "scala",
  dockerfile: "dockerfile",
  docker: "dockerfile",
  xml: "xml",
  vue: "vue",
  svelte: "svelte",
}

/**
 * Find all code block nodes in the document and create decorations
 */
function findCodeBlocks(
  doc: Node,
  highlighter: Highlighter | null,
): DecorationSet {
  const decorations: Decoration[] = []

  if (!highlighter) {
    return DecorationSet.empty
  }

  doc.descendants((node, pos) => {
    if (node.type.name === "codeBlockShiki") {
      const language = node.attrs.language || ""
      const theme = node.attrs.theme || "light-plus"
      const code = node.textContent || ""

      if (code.trim()) {
        try {
          const mappedLanguage = languageMapping[language] || language || "text"
          const supportedLanguages = highlighter.getLoadedLanguages()
          const langToUse = supportedLanguages.includes(mappedLanguage)
            ? mappedLanguage
            : "text"

          // Get highlighted tokens instead of HTML for better control
          const tokens = highlighter.codeToTokens(code, {
            lang: langToUse,
            theme: theme,
          })

          // Create inline decorations for each token
          let offset = 0
          for (const line of tokens.tokens) {
            for (const token of line) {
              if (token.color && token.content) {
                const decoration = Decoration.inline(
                  pos + 1 + offset,
                  pos + 1 + offset + token.content.length,
                  {
                    style: `color: ${token.color}`,
                  },
                )
                decorations.push(decoration)
              }
              offset += token.content.length
            }
            // Add newline character
            offset += 1
          }
        } catch (error) {
          console.error("Failed to highlight code block:", error)
        }
      }
    }
  })

  return DecorationSet.create(doc, decorations)
}

export interface ShikiPluginState {
  highlighter: Highlighter | null
  loading: boolean
  error: Error | null
  decorations: DecorationSet
}

export const createShikiPlugin = (
  options: Partial<ShikiPluginOptions> = {},
) => {
  const pluginOptions = { ...defaultOptions, ...options }

  return new Plugin<ShikiPluginState>({
    key: shikiPluginKey,

    state: {
      init() {
        return {
          highlighter: null,
          loading: true,
          error: null,
          decorations: DecorationSet.empty,
        }
      },

      apply(tr, prevState, prevEditorState) {
        // Update decorations when document changes or attributes change
        let decorations = prevState.decorations
        let needsUpdate = false

        // Check if any codeBlockShiki node attributes changed
        if (prevState.highlighter) {
          // Check for attribute changes by comparing nodes at same positions
          tr.doc.descendants((node, pos) => {
            if (node.type.name === "codeBlockShiki") {
              // Try to find the corresponding node in the previous document
              const oldNode = prevEditorState.doc.nodeAt(pos)
              if (
                oldNode &&
                oldNode.type.name === "codeBlockShiki" &&
                (oldNode.attrs.language !== node.attrs.language ||
                  oldNode.attrs.theme !== node.attrs.theme)
              ) {
                needsUpdate = true
              }
            }
          })
        }

        if ((tr.docChanged || needsUpdate) && prevState.highlighter) {
          decorations = findCodeBlocks(tr.doc, prevState.highlighter)
        } else if (tr.docChanged) {
          // Map decorations to new document positions
          decorations = decorations.map(tr.mapping, tr.doc)
        }

        return {
          ...prevState,
          decorations,
        }
      },
    },

    props: {
      decorations(state) {
        const pluginState = shikiPluginKey.getState(state)
        return pluginState?.decorations || DecorationSet.empty
      },
    },

    view(view) {
      // Initialize highlighter when plugin is attached to view
      let mounted = true

      const initHighlighter = async () => {
        try {
          const highlighter = await createHighlighter({
            themes: pluginOptions.themes,
            langs: pluginOptions.languages,
          })

          if (mounted) {
            // Update plugin state by dispatching a transaction
            const state = view.state
            const pluginState = shikiPluginKey.getState(state)

            if (pluginState) {
              // Mutate the plugin state directly
              pluginState.highlighter = highlighter
              pluginState.loading = false
              pluginState.error = null
              pluginState.decorations = findCodeBlocks(state.doc, highlighter)

              // Force view update - defer to avoid React flushSync warning
              setTimeout(() => {
                if (mounted) {
                  view.dispatch(state.tr)
                }
              }, 0)
            }
          }
        } catch (error) {
          console.error("Failed to initialize Shiki highlighter:", error)

          if (mounted) {
            const state = view.state
            const pluginState = shikiPluginKey.getState(state)

            if (pluginState) {
              pluginState.highlighter = null
              pluginState.loading = false
              pluginState.error =
                error instanceof Error
                  ? error
                  : new Error("Failed to initialize Shiki")

              // Force view update - defer to avoid React flushSync warning
              setTimeout(() => {
                if (mounted) {
                  view.dispatch(state.tr)
                }
              }, 0)
            }
          }
        }
      }

      initHighlighter()

      return {
        destroy() {
          mounted = false
        },
      }
    },
  })
}
