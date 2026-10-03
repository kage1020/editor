import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Stylesheets imported by components are irrelevant to tests; an inline
  // config keeps Vite from loading the Next.js PostCSS pipeline.
  css: {
    postcss: {},
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
