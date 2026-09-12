import { passkey } from "@better-auth/passkey"
import type { BetterAuthOptions } from "better-auth"
import { oneTap, twoFactor } from "better-auth/plugins"
import * as schema from "@/db/schema"

export const authConfig = {
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [passkey(), twoFactor(), oneTap()],
} satisfies BetterAuthOptions

/**
 * Table names in the Drizzle schema are plural, so the adapter pluralizes the
 * singular model names Better Auth uses internally before looking them up.
 */
export const authDatabaseConfig = {
  provider: "sqlite",
  schema,
  usePlural: true,
} as const
