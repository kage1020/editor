"use client"

import type { Editor } from "@tiptap/react"
import { useCallback, useState } from "react"

import { ChevronDownIcon } from "@/components/tiptap-icons"
import { ListButton, type ListType } from "@/components/tiptap-ui/list-button"
import {
  Button,
  ButtonGroup,
  type ButtonProps,
  IconButton,
} from "@/components/tiptap-ui-primitive/button"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { useListDropdownMenu } from "./use-list-dropdown-menu"

interface ListDropdownMenuProps extends Omit<ButtonProps, "type"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor
  /**
   * The list types to display in the dropdown.
   */
  types?: ListType[]
  /**
   * Whether the dropdown should be hidden when no list types are available
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void
  /**
   * Whether to render the dropdown menu in a portal
   * @default false
   */
  portal?: boolean
}

export function ListDropdownMenu({
  editor: providedEditor,
  types = ["bulletList", "orderedList", "taskList"],
  onOpenChange,
  portal = false,
  ...props
}: ListDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { filteredLists, canToggle, isActive, Icon } = useListDropdownMenu({
    types,
  })

  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange],
  )

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          active={isActive ? "on" : "off"}
          role="button"
          tabIndex={-1}
          disabled={!canToggle}
          aria-label="List options"
          tooltip="List"
          {...props}
        >
          <IconButton>
            <Icon />
          </IconButton>
          <IconButton variant="dropdown-small">
            <ChevronDownIcon />
          </IconButton>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" portal={portal}>
        <Card>
          <CardBody>
            <ButtonGroup>
              {filteredLists.map((option) => (
                <DropdownMenuItem key={option.type} asChild>
                  <ListButton type={option.type} text={option.label} />
                </DropdownMenuItem>
              ))}
            </ButtonGroup>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
