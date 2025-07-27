import { getCloudflareContext } from "@opennextjs/cloudflare"
import { drizzle } from "drizzle-orm/d1"
import "server-only"
import * as schema from "./schema"

const { env } = await getCloudflareContext({ async: true })

export const db = drizzle<typeof schema>(env.DB, {
  schema,
})
