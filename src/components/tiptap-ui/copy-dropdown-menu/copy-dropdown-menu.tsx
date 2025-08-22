"use client"

import { forwardRef, useCallback, useState } from "react"
import { CheckIcon, CopyIcon } from "@/components/tiptap-icons"
import { CopyButton, type CopyFormat } from "@/components/tiptap-ui/copy-button"
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, IconButton } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CopyDropdownMenuProps extends Omit<ButtonProps, "type" | "onError"> {
  /**
   * Callback function called after a successful copy
   */
  onCopied?: () => void
  /**
   * Callback function called when copy fails
   */
  onError?: (error: Error) => void
}

/**
 * Dropdown menu component for copying editor content in different formats.
 */
export const CopyDropdownMenu = forwardRef<
  HTMLButtonElement,
  CopyDropdownMenuProps
>(({ onCopied, onError, children, ...buttonProps }, ref) => {
  const [copiedFormat, setCopiedFormat] = useState<CopyFormat | null>(null)

  const handleCopied = useCallback(
    (format: CopyFormat) => {
      setCopiedFormat(format)
      onCopied?.()

      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedFormat(null)
      }, 2000)
    },
    [onCopied],
  )

  const Icon = copiedFormat ? CheckIcon : CopyIcon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          role="button"
          tabIndex={-1}
          aria-label="Copy content"
          tooltip="Copy content"
          {...buttonProps}
          ref={ref}
        >
          {children ?? (
            <IconButton>
              <Icon />
            </IconButton>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        <DropdownMenuLabel>Copy as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <CopyButton
            format="html"
            onCopied={() => handleCopied("html")}
            onError={onError}
            variant="ghost"
            className="w-full justify-start"
          >
            <span className="flex items-center gap-2">
              {copiedFormat === "html" ? <CheckIcon /> : <CopyIcon />}
              HTML
            </span>
          </CopyButton>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <CopyButton
            format="text"
            onCopied={() => handleCopied("text")}
            onError={onError}
            variant="ghost"
            className="w-full justify-start"
          >
            <span className="flex items-center gap-2">
              {copiedFormat === "text" ? <CheckIcon /> : <CopyIcon />}
              Plain Text
            </span>
          </CopyButton>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <CopyButton
            format="markdown"
            onCopied={() => handleCopied("markdown")}
            onError={onError}
            variant="ghost"
            className="w-full justify-start"
          >
            <span className="flex items-center gap-2">
              {copiedFormat === "markdown" ? <CheckIcon /> : <CopyIcon />}
              Markdown
            </span>
          </CopyButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

CopyDropdownMenu.displayName = "CopyDropdownMenu"
