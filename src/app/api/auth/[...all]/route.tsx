import { toNextJsHandler } from "better-auth/next-js"
import { getAuth } from "@/auth/server"

export const { GET, POST } = toNextJsHandler(async (request) => {
  const auth = await getAuth()
  return auth.handler(request)
})
