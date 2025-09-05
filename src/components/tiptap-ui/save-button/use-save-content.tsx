"use client"

import { useCurrentEditor } from "@tiptap/react"
import { useCallback, useTransition } from "react"
import { saveContentAction } from "@/app/actions/save-content"

interface UseSaveContentConfig {
  onSaved?: () => void
}

export function useSaveContent({ onSaved }: UseSaveContentConfig = {}) {
  const { editor } = useCurrentEditor()
  const [isPending, startTransition] = useTransition()

  const handleSave = useCallback(async () => {
    if (!editor) return false

    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        try {
          const content = editor.getHTML()
          const json = editor.getJSON()

          const result = await saveContentAction({
            content,
            json,
            title: undefined, // You can add title from editor if needed
          })

          if (result.success) {
            onSaved?.()
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
  }, [editor, onSaved])

  return {
    handleSave,
    isSaving: isPending,
  }
}
