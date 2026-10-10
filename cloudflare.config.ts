import { bindings, defineConfig, triggers } from "cf/config"

export default defineConfig({
  accountId: "c7e4b52c35486cab775a555e9f1b5abc",
  worker: {
    name: "editor",
    compatibilityDate: "2026-08-19",
    compatibilityFlags: ["nodejs_compat", "global_fetch_strictly_public"],
    entrypoint: "src/worker.ts",
    // vinext renders its own not-found pages.
    assets: { notFoundHandling: "none" },
    /**
     * Preview URLs are served from the workers.dev subdomain, so both flags are
     * needed for pull request builds to publish a version at
     * <version>-editor.<subdomain>.workers.dev. Without them a build uploads a
     * version but there is nothing to open.
     */
    workersDev: true,
    previewUrls: true,
    observability: {
      enabled: true,
    },
    domains: ["editor.kage1020.com"],
    triggers: [
      // Daily sweep of uploaded images no document shows any more.
      triggers.scheduled({
        schedule: "0 18 * * *",
      }),
    ],
    env: {
      DB: bindings.d1({
        name: "editor",
        id: "8037b9e6-9241-423b-9e85-8a44ac3feb00",
      }),
      UPLOADS: bindings.r2({
        name: "editor",
      }),
      ASSETS: bindings.assets(),
    },
  },
})
