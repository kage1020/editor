import FileHandler from "@tiptap/extension-file-handler"
import type { Editor } from "@tiptap/react"
import { toast } from "sonner"
import { IMAGE_TYPES } from "@/lib/image-file"
import { uploadImage } from "@/lib/upload-image"
import {
  removeImagesWithSource,
  replaceImageSource,
} from "@/lib/uploading-image"

/**
 * Shows each file immediately from a local object URL and swaps in the
 * uploaded URL once the upload finishes. The image is found again by its
 * preview URL because the document may have changed in the meantime.
 */
function insertUploadingImages(editor: Editor, files: File[], pos?: number) {
  const uploads = files.map((file) => ({
    file,
    preview: URL.createObjectURL(file),
  }))

  const images = uploads.map(({ file, preview }) => ({
    type: "image",
    attrs: { src: preview, alt: file.name.replace(/\.[^/.]+$/, "") },
  }))
  const chain = editor.chain().focus()
  if (pos === undefined) {
    chain.insertContent(images)
  } else {
    chain.insertContentAt(pos, images)
  }
  chain.run()

  for (const { file, preview } of uploads) {
    uploadImage(file)
      .then((url) => {
        // The editor is torn down when another document is opened.
        if (editor.isDestroyed) return
        const tr = replaceImageSource(editor.state, preview, url)
        if (tr) editor.view.dispatch(tr)
      })
      .catch((error: Error) => {
        if (!editor.isDestroyed) {
          const tr = removeImagesWithSource(editor.state, preview)
          if (tr) editor.view.dispatch(tr)
        }
        toast.error(`Failed to upload ${file.name}`, {
          description: error.message,
        })
      })
      .finally(() => URL.revokeObjectURL(preview))
  }
}

export const ImagePaste = FileHandler.configure({
  allowedMimeTypes: IMAGE_TYPES,
  // Images copied from a web page also carry HTML with an <img> pointing at
  // the original; letting that through would insert the image twice.
  consumePasteEvent: true,
  onPaste: (editor, files) => insertUploadingImages(editor, files),
  onDrop: (editor, files, pos) => insertUploadingImages(editor, files, pos),
})
