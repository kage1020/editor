import { db } from "@/db"
import * as schema from "@/db/schema"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { oneTap, twoFactor } from "better-auth/plugins"
import { passkey } from "better-auth/plugins/passkey"
import { headers } from "next/headers"
import "server-only"
import { authConfig } from "./config"

export const auth = betterAuth({
  ...authConfig,
  database: drizzleAdapter(db, { provider: "sqlite", schema, usePlural: true }),
  plugins: [passkey(), twoFactor(), oneTap()],
})

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}
