import { getCloudflareContext } from "@opennextjs/cloudflare"
import { drizzle } from "drizzle-orm/d1"
import "server-only"
import * as schema from "./schema"

function createDb(env: CloudflareEnv) {
  return drizzle<typeof schema>(env.DB, { schema })
}

export type Db = ReturnType<typeof createDb>

let dbPromise: Promise<Db> | undefined

/**
 * Connects on first use rather than at import: `next build` imports every
 * route in parallel workers, and fetching the context there starts a local
 * Workers runtime per worker that all contend for the same SQLite files.
 */
export function getDb(): Promise<Db> {
  dbPromise ??= getCloudflareContext({ async: true }).then(
    ({ env }) => createDb(env),
    (error: unknown) => {
      dbPromise = undefined
      throw error
    },
  )
  return dbPromise
}
