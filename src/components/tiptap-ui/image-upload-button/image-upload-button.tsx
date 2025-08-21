"use client"

import { Badge } from "@/components/tiptap-ui-primitive/badge"
import type { UseImageUploadConfig } from "@/components/tiptap-ui/image-upload-button"
import {
  IMAGE_UPLOAD_SHORTCUT_KEY,
  useImageUpload,
} from "@/components/tiptap-ui/image-upload-button"
import { forwardRef, useCallback } from "react"

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonIcon } from "@/components/tiptap-ui-primitive/button"
import { parseShortcutKeys } from "@/lib/tiptap-utils"

export interface ImageUploadButtonProps
  extends Omit<ButtonProps, "type">,
    UseImageUploadConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean
}

export function ImageShortcutBadge({
  shortcutKeys = IMAGE_UPLOAD_SHORTCUT_KEY,
}: {
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

/**
 * Button component for uploading/inserting images in a Tiptap editor.
 *
 * For custom button implementations, use the `useImage` hook instead.
 */
export const ImageUploadButton = forwardRef<
  HTMLButtonElement,
  ImageUploadButtonProps
>(
  (
    {
      text,
      onInserted,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { canInsert, handleImage, label, isActive, shortcutKeys, Icon } =
      useImageUpload({
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
            {showShortcut && <ImageShortcutBadge shortcutKeys={shortcutKeys} />}
          </>
        )}
      </Button>
    )
  },
)

ImageUploadButton.displayName = "ImageUploadButton"
