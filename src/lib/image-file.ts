export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/**
 * Raster formats a browser renders without running content. SVG is left out
 * because, served from this origin, it can execute script.
 */
export const IMAGE_EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
} as const

export type ImageType = keyof typeof IMAGE_EXTENSIONS

export const IMAGE_TYPES = Object.keys(IMAGE_EXTENSIONS) as ImageType[]

/** Enough leading bytes to recognize every format in `IMAGE_EXTENSIONS`. */
export const IMAGE_SIGNATURE_BYTES = 12

function startsWith(data: Uint8Array, offset: number, signature: string) {
  if (data.length < offset + signature.length) return false
  for (let i = 0; i < signature.length; i++) {
    if (data[offset + i] !== signature.charCodeAt(i)) return false
  }
  return true
}

export function detectImageType(data: Uint8Array): ImageType | null {
  if (startsWith(data, 0, "\x89PNG\r\n\x1a\n")) return "image/png"
  if (startsWith(data, 0, "\xff\xd8\xff")) return "image/jpeg"
  if (startsWith(data, 0, "GIF87a") || startsWith(data, 0, "GIF89a")) {
    return "image/gif"
  }
  if (startsWith(data, 0, "RIFF") && startsWith(data, 8, "WEBP")) {
    return "image/webp"
  }
  if (
    startsWith(data, 4, "ftyp") &&
    (startsWith(data, 8, "avif") || startsWith(data, 8, "avis"))
  ) {
    return "image/avif"
  }
  return null
}

const IMAGE_FILE_NAME = new RegExp(
  `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(${Object.values(
    IMAGE_EXTENSIONS,
  ).join("|")})$`,
)

/** Whether `name` has the shape the upload route gives stored images. */
export function isImageFileName(name: string): boolean {
  return IMAGE_FILE_NAME.test(name)
}
