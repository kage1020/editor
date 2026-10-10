import { defineWranglerConfig } from "wrangler/experimental-config"

export default defineWranglerConfig({
  // Wraps the OpenNext worker in src/worker.ts to add the cron handler.
  alias: {
    "open-next-worker": "./.open-next/worker.js",
  },
  keepNames: false,
  assetsDirectory: ".open-next/assets",
})
