import { getCloudflareContext } from "@opennextjs/cloudflare"
import { isImageFileName } from "@/lib/image-file"

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/images/[userId]/[file]">,
) {
  const { userId, file } = await params
  if (!/^[\w-]+$/.test(userId) || !isImageFileName(file))
    return new Response(null, { status: 404 })

  const { env } = await getCloudflareContext({ async: true })
  const object = await env.UPLOADS.get(`${userId}/${file}`)
  if (!object) return new Response(null, { status: 404 })

  return new Response(object.body, {
    headers: {
      "Content-Type":
        object.httpMetadata?.contentType ?? "application/octet-stream",
      "Content-Length": String(object.size),
      ETag: object.httpEtag,
      // Names are random and never reused, so the bytes behind a URL never change.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
