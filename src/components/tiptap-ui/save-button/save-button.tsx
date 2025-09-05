"use client"

import { Check, Loader2, Save } from "lucide-react"
import { forwardRef, useCallback, useState } from "react"
import {
  Button,
  type ButtonProps,
  IconButton,
} from "@/components/tiptap-ui-primitive/button"
import { useSaveContent } from "./use-save-content"

interface SaveButtonProps extends Omit<ButtonProps, "type"> {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Callback when save is completed
   */
  onSaved?: () => void
}

/**
 * Button component for saving editor content to D1 database.
 */
export const SaveButton = forwardRef<HTMLButtonElement, SaveButtonProps>(
  ({ text, onSaved, onClick, children, ...buttonProps }, ref) => {
    const { handleSave, isSaving } = useSaveContent({ onSaved })
    const [showSuccess, setShowSuccess] = useState(false)

    const handleClick = useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return

        const success = await handleSave()
        if (success) {
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 2000)
        }
      },
      [handleSave, onClick],
    )

    return (
      <Button
        type="button"
        disabled={isSaving}
        variant="ghost"
        role="button"
        tabIndex={-1}
        aria-label="Save content"
        tooltip="Save (Ctrl+S)"
        shortcutKeys="Ctrl+S"
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            {showSuccess && !isSaving && (
              <Check className="text-green-600 size-4" />
            )}
            <IconButton>{!showSuccess && !isSaving && <Save />}</IconButton>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  },
)

SaveButton.displayName = "SaveButton"
