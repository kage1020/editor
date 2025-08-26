import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/auth/server"

export const runtime = "edge"

export const { GET, POST } = toNextJsHandler(auth.handler)
