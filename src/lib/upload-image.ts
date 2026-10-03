import { MAX_IMAGE_BYTES } from "@/lib/image-file"

function responseError(xhr: XMLHttpRequest): Error {
  const message =
    xhr.response && typeof xhr.response.error === "string"
      ? xhr.response.error
      : `Upload failed (${xhr.status})`
  return new Error(message)
}

/**
 * Uploads an image and resolves to the URL it is served from. XHR is used
 * because fetch does not report upload progress.
 */
export function uploadImage(
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal,
): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    return Promise.reject(
      new Error(`Image exceeds the ${MAX_IMAGE_BYTES / (1024 * 1024)}MB limit`),
    )
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/images")
    xhr.responseType = "json"

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.({
          progress: Math.round((event.loaded / event.total) * 100),
        })
      }
    }
    xhr.onload = () => {
      if (xhr.status === 201 && typeof xhr.response?.url === "string") {
        resolve(xhr.response.url)
      } else {
        reject(responseError(xhr))
      }
    }
    xhr.onerror = () => reject(new Error("Upload failed: network error"))
    xhr.onabort = () => reject(new Error("Upload cancelled"))

    if (abortSignal?.aborted) {
      reject(new Error("Upload cancelled"))
      return
    }
    abortSignal?.addEventListener("abort", () => xhr.abort(), { once: true })

    const form = new FormData()
    form.append("file", file)
    xhr.send(form)
  })
}
