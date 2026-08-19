import { passkey } from "@better-auth/passkey"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { oneTap, twoFactor } from "better-auth/plugins"
import { headers } from "next/headers"
import { cache } from "react"
import { db } from "@/db"
import * as schema from "@/db/schema"
import "server-only"
import { authConfig } from "./config"

export const auth = betterAuth({
  ...authConfig,
  database: drizzleAdapter(db, { provider: "sqlite", schema, usePlural: true }),
  plugins: [passkey(), twoFactor(), oneTap()],
})

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
)
