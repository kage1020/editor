import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      // The vinext Vite plugin, which tests do not load, maps next/* to its shims.
      { find: /^next\/(.*)$/, replacement: "vinext/shims/$1" },
    ],
  },
  // Stylesheets imported by components are irrelevant to tests; an inline
  // config keeps Vite from loading the project's PostCSS pipeline.
  css: {
    postcss: {},
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
