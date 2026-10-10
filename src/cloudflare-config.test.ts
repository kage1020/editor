import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { unstable_readConfig } from "wrangler"
import cloudflareConfig from "../cloudflare.config"

/**
 * `next dev` gets its bindings from Wrangler's `getPlatformProxy`, which only
 * reads `wrangler.jsonc`, while deployments are built from
 * `cloudflare.config.ts`. These cases keep the two from drifting apart.
 */
const wranglerConfigPath = fileURLToPath(
  new URL("../wrangler.jsonc", import.meta.url),
)
const local = unstable_readConfig({ config: wranglerConfigPath })
const { worker } = cloudflareConfig

describe("local development configuration", () => {
  it("runs on the deployed compatibility date and flags", () => {
    expect(local.compatibility_date).toBe(worker.compatibilityDate)
    expect([...local.compatibility_flags].sort()).toEqual(
      [...(worker.compatibilityFlags ?? [])].sort(),
    )
  })

  it("binds the deployed D1 database by the ID local migrations target", () => {
    expect(local.d1_databases).toEqual([
      expect.objectContaining({
        binding: "DB",
        database_name: worker.env.DB.name,
        database_id: worker.env.DB.id,
      }),
    ])
    expect(local.d1_databases[0].preview_database_id).toBeUndefined()
  })

  it("binds the deployed R2 bucket", () => {
    expect(local.r2_buckets).toEqual([
      expect.objectContaining({
        binding: "UPLOADS",
        bucket_name: worker.env.UPLOADS.name,
      }),
    ])
  })

  it("cannot be deployed with Wrangler", () => {
    expect(local.main).toBeUndefined()
    expect(local.routes).toBeUndefined()
    expect(local.triggers.crons).toBeUndefined()
  })
})
