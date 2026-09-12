import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { headers } from "next/headers"
import { cache } from "react"
import { db } from "@/db"
import "server-only"
import { authConfig, authDatabaseConfig } from "./config"

export const auth = betterAuth({
  ...authConfig,
  database: drizzleAdapter(db, authDatabaseConfig),
})

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
)
