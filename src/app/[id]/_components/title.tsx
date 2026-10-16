"use client"

import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { updateTitleAction } from "@/actions/content"
import { authClient } from "@/auth/client"
import { cn } from "@/lib/utils"

interface TitleProps {
  title: string
  className?: string
  onChange: (title: string) => void
}

const documentIdSchema = z.uuid()

export function Title({ title, className, onChange }: TitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const params = useParams()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const documentId = documentIdSchema.safeParse(params?.id).data

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus()
  }, [isEditing])

  const handleSave = useCallback(async () => {
    // Check authentication
    if (!session?.user) {
      toast.error("ログインが必要です")
      return
    }

    const newTitle = title.trim() || "Untitled"
    const currentId = documentId || (params?.id as string)

    startTransition(async () => {
      try {
        const result = await updateTitleAction({
          id: currentId,
          title: newTitle,
        })

        if (!result.success) {
          console.error("Failed to save title:", result.error)
          toast.error(`タイトルの保存に失敗しました: ${result.error}`)
          onChange(title)
        } else {
          toast.success("タイトルを保存しました")
          // If this was a new document creation and we got a valid ID back, navigate to it
          if (!documentId && result.id !== currentId) {
            router.replace(`/${result.id}`)
          }
        }
      } catch (error) {
        console.error("Error saving title:", error)
        toast.error("タイトルの保存中にエラーが発生しました")
        onChange(title)
      }
    })
  }, [documentId, title, onChange, router, params, session])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    handleSave()
  }, [handleSave])

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        inputRef.current?.blur()
      } else if (e.key === "Escape") {
        e.preventDefault()
        onChange(title)
        setIsEditing(false)
      }
    },
    [title, onChange],
  )

  const handleClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLHeadingElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        setIsEditing(true)
      }
    },
    [],
  )

  return (
    <div className={cn("w-full", className)}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleInputKeyDown}
          aria-busy={isPending}
          className={cn(
            "w-full bg-transparent border-b border-kg-border text-foreground",
            "text-[26px] sm:text-[32px] leading-[1.3] font-bold tracking-[-0.01em]",
          )}
          placeholder="Enter title..."
        />
      ) : (
        <h1
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label="Click to edit title"
          aria-busy={isPending}
          className={cn(
            "cursor-text rounded-sm text-foreground",
            "text-[26px] sm:text-[32px] leading-[1.3] font-bold tracking-[-0.01em]",
            "border-b border-transparent hover:border-kg-line transition-colors duration-100",
          )}
        >
          {title}
        </h1>
      )}
    </div>
  )
}
