import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { headers } from "next/headers"
import { cache } from "react"
import { getDb } from "@/db"
import "server-only"
import { authConfig, authDatabaseConfig } from "./config"

async function createAuth() {
  return betterAuth({
    ...authConfig,
    database: drizzleAdapter(await getDb(), authDatabaseConfig),
  })
}

let authPromise: ReturnType<typeof createAuth> | undefined

export function getAuth() {
  authPromise ??= createAuth().catch((error: unknown) => {
    authPromise = undefined
    throw error
  })
  return authPromise
}

export const getSession = cache(async () => {
  // Reading the request first lets routes rendered at build time bail out
  // to dynamic rendering before anything connects to the database.
  const requestHeaders = await headers()
  const auth = await getAuth()
  return auth.api.getSession({ headers: requestHeaders })
})
