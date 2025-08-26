import type { Node } from "@tiptap/pm/model"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import type { HighlighterCore, LanguageInput, ThemeInput } from "shiki"
import { createHighlighterCore } from "shiki/core"
import { createOnigurumaEngine } from "shiki/engine/oniguruma"

export interface ShikiPluginOptions {
  /**
   * Languages to load
   */
  languages: LanguageInput[]
  /**
   * Themes to load
   */
  themes: ThemeInput[]
}

const defaultOptions: ShikiPluginOptions = {
  languages: [
    import("shiki/langs/javascript.mjs"),
    import("shiki/langs/typescript.mjs"),
    import("shiki/langs/html.mjs"),
    import("shiki/langs/css.mjs"),
    import("shiki/langs/scss.mjs"),
    import("shiki/langs/sass.mjs"),
    import("shiki/langs/json.mjs"),
    import("shiki/langs/python.mjs"),
    import("shiki/langs/bash.mjs"),
    import("shiki/langs/sql.mjs"),
    import("shiki/langs/yaml.mjs"),
    import("shiki/langs/markdown.mjs"),
    import("shiki/langs/java.mjs"),
    import("shiki/langs/cpp.mjs"),
    import("shiki/langs/c.mjs"),
    import("shiki/langs/php.mjs"),
    import("shiki/langs/ruby.mjs"),
    import("shiki/langs/go.mjs"),
    import("shiki/langs/rust.mjs"),
    import("shiki/langs/swift.mjs"),
    import("shiki/langs/kotlin.mjs"),
    import("shiki/langs/scala.mjs"),
    import("shiki/langs/dockerfile.mjs"),
    import("shiki/langs/xml.mjs"),
    import("shiki/langs/vue.mjs"),
    import("shiki/langs/svelte.mjs"),
  ],
  themes: [
    import("shiki/themes/light-plus.mjs"),
    import("shiki/themes/dark-plus.mjs"),
  ],
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
  highlighter: HighlighterCore | null,
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
  highlighter: HighlighterCore | null
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
          const highlighter = await createHighlighterCore({
            themes: pluginOptions.themes,
            langs: pluginOptions.languages,
            engine: createOnigurumaEngine(import("shiki/wasm")),
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
