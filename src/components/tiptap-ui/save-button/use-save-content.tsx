"use client"

import { useCurrentEditor } from "@tiptap/react"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useTransition } from "react"
import { z } from "zod"
import { saveContentAction } from "@/app/actions/content"

interface UseSaveContentConfig {
  onSaved?: () => void
  title?: string | null
}

const documentIdSchema = z.uuid().optional()

export function useSaveContent({ onSaved, title }: UseSaveContentConfig = {}) {
  const { editor } = useCurrentEditor()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const params = useParams()

  const documentId = documentIdSchema.safeParse(params?.id).data

  const handleSave = useCallback(async () => {
    if (!editor) return false

    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        try {
          const content = editor.getHTML()
          const json = editor.getJSON()

          const result = await saveContentAction({
            id: documentId,
            content,
            json,
            title,
          })

          if (result.success) {
            onSaved?.()
            router.replace(`/${result.id}`)
            resolve(true)
          } else {
            console.error("Failed to save:", result.error)
            resolve(false)
          }
        } catch (error) {
          console.error("Error saving content:", error)
          resolve(false)
        }
      })
    })
  }, [editor, onSaved, router, documentId, title])

  return {
    handleSave,
    isSaving: isPending,
  }
}
