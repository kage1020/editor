"use client"

import { forwardRef, useCallback } from "react"
import {
  Button,
  ButtonIcon,
  type ButtonProps,
} from "@/components/tiptap-ui-primitive/button"
import { type UseImageUploadConfig, useImageUpload } from "./use-image-upload"

interface ImageUploadButtonProps
  extends Omit<ButtonProps, "type">,
    UseImageUploadConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
}

/**
 * Button component for uploading/inserting images in a Tiptap editor.
 *
 * For custom button implementations, use the `useImage` hook instead.
 */
export const ImageUploadButton = forwardRef<
  HTMLButtonElement,
  ImageUploadButtonProps
>(({ text, onInserted, onClick, children, ...buttonProps }, ref) => {
  const { canInsert, handleImage, label, isActive, Icon } = useImageUpload({
    onInserted,
  })

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (event.defaultPrevented) return
      handleImage()
    },
    [handleImage, onClick],
  )

  return (
    <Button
      type="button"
      data-style="ghost"
      active={isActive ? "on" : "off"}
      role="button"
      tabIndex={-1}
      disabled={!canInsert}
      aria-label={label}
      aria-pressed={isActive}
      tooltip={label}
      onClick={handleClick}
      {...buttonProps}
      ref={ref}
    >
      {children ?? (
        <>
          <ButtonIcon>
            <Icon />
          </ButtonIcon>
          {text && <span className="tiptap-button-text">{text}</span>}
        </>
      )}
    </Button>
  )
})

ImageUploadButton.displayName = "ImageUploadButton"
