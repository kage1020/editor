"use client"

import { useParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { z } from "zod"
import { updateTitleAction } from "@/app/actions/content"
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
  const documentId = documentIdSchema.safeParse(params?.id).data

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus()
  }, [isEditing])

  const handleSave = useCallback(async () => {
    if (!documentId) return

    const newTitle = title.trim() || "Untitled"

    startTransition(async () => {
      try {
        const result = await updateTitleAction({
          id: documentId,
          title: newTitle,
        })

        if (!result.success) {
          console.error("Failed to save title:", result.error)
          onChange(title)
        }
      } catch (error) {
        console.error("Error saving title:", error)
        onChange(title)
      }
    })
  }, [documentId, title, onChange])

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
          disabled={isPending}
          className={cn(
            "w-full text-3xl font-bold bg-transparent border-b-2 border-gray-300 dark:border-gray-600",
            "focus:outline-none",
            "transition-colors duration-200",
            "text-gray-900 dark:text-gray-100",
            isPending && "opacity-50 cursor-not-allowed",
          )}
          placeholder="Enter title..."
        />
      ) : (
        <h1
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label="Click to edit title"
          className={cn(
            "text-3xl font-bold cursor-pointer",
            "text-gray-900 dark:text-gray-100",
            "transition-colors duration-200",
            "border-b-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700",
            "focus:outline-none",
            isPending && "opacity-50",
          )}
        >
          {title}
        </h1>
      )}
    </div>
  )
}
