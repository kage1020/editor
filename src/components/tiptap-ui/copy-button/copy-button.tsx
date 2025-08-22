"use client"

import { forwardRef, useCallback } from "react"
import type { UseCopyConfig } from "@/components/tiptap-ui/copy-button"
import { useCopy } from "@/components/tiptap-ui/copy-button"

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, IconButton } from "@/components/tiptap-ui-primitive/button"

interface CopyButtonProps
  extends Omit<ButtonProps, "type" | "onError">,
    UseCopyConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
}

/**
 * Button component for copying editor content in a Tiptap editor.
 *
 * For custom button implementations, use the `useCopy` hook instead.
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    { format, text, onCopied, onError, onClick, children, ...buttonProps },
    ref,
  ) => {
    const { handleCopy, label, canCopy, Icon } = useCopy({
      format,
      onCopied,
      onError,
    })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleCopy()
      },
      [handleCopy, onClick],
    )

    return (
      <Button
        type="button"
        disabled={!canCopy}
        variant="ghost"
        role="button"
        tabIndex={-1}
        aria-label={label}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <IconButton>
              <Icon />
            </IconButton>
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  },
)

CopyButton.displayName = "CopyButton"
