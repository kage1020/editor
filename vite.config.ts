import { cloudflare } from "@cloudflare/vite-plugin"
import vinext from "vinext"
import { defineConfig } from "vite"

export default defineConfig({
  server: { port: 3000 },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
})
