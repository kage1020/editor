import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getSession } from "@/auth/server"
import {
  detectImageType,
  IMAGE_EXTENSIONS,
  IMAGE_SIGNATURE_BYTES,
  MAX_IMAGE_BYTES,
} from "@/lib/image-file"

function error(status: number, message: string) {
  return Response.json({ error: message }, { status })
}

export async function POST(request: Request) {
  const session = await getSession()
  const userId = session?.user?.id
  if (!userId) return error(401, "Sign in to upload images")

  const form = await request.formData().catch(() => null)
  const file = form?.get("file")
  if (!(file instanceof File)) return error(400, "No image provided")

  if (file.size > MAX_IMAGE_BYTES) {
    return error(
      413,
      `Image exceeds the ${MAX_IMAGE_BYTES / (1024 * 1024)}MB limit`,
    )
  }

  // The declared type comes from the client, so the stored type is taken
  // from the bytes instead.
  const data = await file.arrayBuffer()
  const type = detectImageType(
    new Uint8Array(data, 0, Math.min(data.byteLength, IMAGE_SIGNATURE_BYTES)),
  )
  if (!type) return error(415, "Unsupported image format")

  const key = `${userId}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[type]}`
  const { env } = await getCloudflareContext({ async: true })
  await env.UPLOADS.put(key, data, { httpMetadata: { contentType: type } })

  return Response.json({ url: `/api/images/${key}` }, { status: 201 })
}
