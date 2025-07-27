import { oneTapClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { authConfig } from "./config"

export const authClient = createAuthClient({
  ...authConfig,
  plugins: [
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
      cancelOnTapOutside: true,
      context: "signin",
    }),
  ],
})
