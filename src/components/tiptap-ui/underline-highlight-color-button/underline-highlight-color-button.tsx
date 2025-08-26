"use client"

import { forwardRef } from "react"
import { HighlighterIcon } from "@/components/tiptap-icons"
import {
  Button,
  type ButtonProps,
  IconButton,
} from "@/components/tiptap-ui-primitive/button"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { cn } from "@/lib/utils"

export interface UnderlineHighlightColorButtonProps
  extends Omit<ButtonProps, "onClick" | "color"> {
  /**
   * Color value for the underline highlight.
   */
  color: string
  /**
   * Whether the button is highlighted (used for navigation).
   */
  highlighted?: boolean
  /**
   * Callback fired when the underline highlight is applied.
   */
  onApplied?: () => void
}

export const UnderlineHighlightColorButton = forwardRef<
  HTMLButtonElement,
  UnderlineHighlightColorButtonProps
>(({ color, highlighted, onApplied, className, ...props }, ref) => {
  const { editor } = useTiptapEditor()

  if (!editor) return null

  const isActive = editor.isActive("underlineHighlight", { color })

  const handleClick = () => {
    editor.chain().focus().toggleUnderlineHighlight({ color }).run()
    onApplied?.()
  }

  return (
    <Button
      ref={ref}
      type="button"
      className={cn(
        "relative overflow-hidden",
        highlighted &&
          "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100",
        className,
      )}
      variant={isActive ? "default" : "ghost"}
      onClick={handleClick}
      disabled={
        !editor.can().chain().focus().toggleUnderlineHighlight({ color }).run()
      }
      aria-pressed={isActive}
      {...props}
    >
      <div className="relative">
        <IconButton>
          <HighlighterIcon />
        </IconButton>
        {/* Color indicator bar at bottom */}
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-0.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </Button>
  )
})
UnderlineHighlightColorButton.displayName = "UnderlineHighlightColorButton"
