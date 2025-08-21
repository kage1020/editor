"use client"

import { forwardRef, useCallback, useState } from "react"
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { HeadingButton } from "@/components/tiptap-ui/heading-button"
import {
  Button,
  ButtonGroup,
  ButtonIcon,
  type ButtonProps,
} from "@/components/tiptap-ui-primitive/button"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import {
  type UseHeadingDropdownMenuConfig,
  useHeadingDropdownMenu,
} from "./use-heading-dropdown-menu"

interface HeadingDropdownMenuProps
  extends Omit<ButtonProps, "type">,
    UseHeadingDropdownMenuConfig {
  /**
   * Whether to render the dropdown menu in a portal
   * @default false
   */
  portal?: boolean
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void
}

/**
 * Dropdown menu component for selecting heading levels in a Tiptap editor.
 *
 * For custom dropdown implementations, use the `useHeadingDropdownMenu` hook instead.
 */
export const HeadingDropdownMenu = forwardRef<
  HTMLButtonElement,
  HeadingDropdownMenuProps
>(
  (
    {
      levels = [1, 2, 3, 4, 5, 6],
      portal = false,
      onOpenChange,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor()
    const [isOpen, setIsOpen] = useState(false)
    const { isActive, canToggle, Icon } = useHeadingDropdownMenu({
      levels,
    })

    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!editor || !canToggle) return
        setIsOpen(open)
        onOpenChange?.(open)
      },
      [canToggle, editor, onOpenChange],
    )

    return (
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            active={isActive ? "on" : "off"}
            role="button"
            tabIndex={-1}
            disabled={!canToggle}
            aria-label="Format text as heading"
            aria-pressed={isActive}
            tooltip="Heading"
            {...buttonProps}
            ref={ref}
          >
            <ButtonIcon>
              <Icon />
            </ButtonIcon>
            <ButtonIcon variant="dropdown-small">
              <ChevronDownIcon />
            </ButtonIcon>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" portal={portal}>
          <Card>
            <CardBody>
              <ButtonGroup>
                {levels.map((level) => (
                  <DropdownMenuItem key={`heading-${level}`} asChild>
                    <HeadingButton level={level} text={`Heading ${level}`} />
                  </DropdownMenuItem>
                ))}
              </ButtonGroup>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
)

HeadingDropdownMenu.displayName = "HeadingDropdownMenu"
