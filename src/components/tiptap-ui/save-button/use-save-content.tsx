"use client"

import { useCurrentEditor } from "@tiptap/react"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useTransition } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { saveContentAction } from "@/actions/content"

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
            toast.success("保存しました")
            onSaved?.()
            router.replace(`/${result.id}`)
            resolve(true)
          } else {
            console.error("Failed to save:", result.error)
            toast.error(`保存に失敗しました: ${result.error}`)
            resolve(false)
          }
        } catch (error) {
          console.error("Error saving content:", error)
          toast.error("保存中にエラーが発生しました")
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
