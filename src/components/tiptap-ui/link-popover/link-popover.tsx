"use client"

import { forwardRef, useCallback, useEffect, useState } from "react"
import { CornerDownLeftIcon } from "@/components/tiptap-icons/corner-down-left-icon"
import { ExternalLinkIcon } from "@/components/tiptap-icons/external-link-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"
import { TrashIcon } from "@/components/tiptap-icons/trash-icon"
import {
  Button,
  ButtonGroup,
  ButtonIcon,
  type ButtonProps,
} from "@/components/tiptap-ui-primitive/button"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"
import { Input, InputGroup } from "@/components/tiptap-ui-primitive/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { type UseLinkPopoverConfig, useLinkPopover } from "./use-link-popover"

interface LinkMainProps {
  /**
   * The URL to set for the link.
   */
  url: string
  /**
   * Function to update the URL state.
   */
  setUrl: React.Dispatch<React.SetStateAction<string | null>>
  /**
   * Function to set the link in the editor.
   */
  setLink: () => void
  /**
   * Function to remove the link from the editor.
   */
  removeLink: () => void
  /**
   * Function to open the link.
   */
  openLink: () => void
  /**
   * Whether the link is currently active in the editor.
   */
  isActive: boolean
}

interface LinkPopoverProps
  extends Omit<ButtonProps, "type">,
    UseLinkPopoverConfig {
  /**
   * Callback for when the popover opens or closes.
   */
  onOpenChange?: (isOpen: boolean) => void
  /**
   * Whether to automatically open the popover when a link is active.
   * @default true
   */
  autoOpenOnLinkActive?: boolean
}

/**
 * Link button component for triggering the link popover
 */
const LinkButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        type="button"
        className={className}
        data-style="ghost"
        role="button"
        tabIndex={-1}
        aria-label="Link"
        tooltip="Link"
        ref={ref}
        {...props}
      >
        {children || (
          <ButtonIcon>
            <LinkIcon />
          </ButtonIcon>
        )}
      </Button>
    )
  },
)

LinkButton.displayName = "LinkButton"

/**
 * Main content component for the link popover
 */
const LinkMain: React.FC<LinkMainProps> = ({
  url,
  setUrl,
  setLink,
  removeLink,
  openLink,
  isActive,
}) => {
  const isMobile = useIsMobile()

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault()
      setLink()
    }
  }

  return (
    <Card
      style={{
        ...(isMobile ? { boxShadow: "none", border: 0 } : {}),
      }}
    >
      <CardBody
        style={{
          ...(isMobile ? { padding: 0 } : {}),
        }}
      >
        <CardItemGroup orientation="horizontal">
          <InputGroup>
            <Input
              type="url"
              placeholder="Paste a link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </InputGroup>

          <ButtonGroup orientation="horizontal">
            <Button
              type="button"
              onClick={setLink}
              title="Apply link"
              disabled={!url && !isActive}
              data-style="ghost"
            >
              <ButtonIcon>
                <CornerDownLeftIcon />
              </ButtonIcon>
            </Button>
          </ButtonGroup>

          <Separator />

          <ButtonGroup orientation="horizontal">
            <Button
              type="button"
              onClick={openLink}
              title="Open in new window"
              disabled={!url && !isActive}
              data-style="ghost"
            >
              <ButtonIcon>
                <ExternalLinkIcon />
              </ButtonIcon>
            </Button>

            <Button
              type="button"
              onClick={removeLink}
              title="Remove link"
              disabled={!url && !isActive}
              data-style="ghost"
            >
              <ButtonIcon>
                <TrashIcon />
              </ButtonIcon>
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

/**
 * Link popover component for Tiptap editors.
 *
 * For custom popover implementations, use the `useLinkPopover` hook instead.
 */
export const LinkPopover = forwardRef<HTMLButtonElement, LinkPopoverProps>(
  (
    {
      onSetLink,
      onOpenChange,
      autoOpenOnLinkActive = true,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false)

    const {
      canSet,
      isActive,
      url,
      setUrl,
      setLink,
      removeLink,
      openLink,
      label,
      Icon,
    } = useLinkPopover({
      onSetLink,
    })

    const handleOnOpenChange = useCallback(
      (nextIsOpen: boolean) => {
        setIsOpen(nextIsOpen)
        onOpenChange?.(nextIsOpen)
      },
      [onOpenChange],
    )

    const handleSetLink = useCallback(() => {
      setLink()
      setIsOpen(false)
    }, [setLink])

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        setIsOpen(!isOpen)
      },
      [onClick, isOpen],
    )

    useEffect(() => {
      if (autoOpenOnLinkActive && isActive) {
        setIsOpen(true)
      }
    }, [autoOpenOnLinkActive, isActive])

    return (
      <Popover open={isOpen} onOpenChange={handleOnOpenChange}>
        <PopoverTrigger asChild>
          <LinkButton
            disabled={!canSet}
            active={isActive ? "on" : "off"}
            aria-label={label}
            aria-pressed={isActive}
            onClick={handleClick}
            {...buttonProps}
            ref={ref}
          >
            {children ?? (
              <ButtonIcon>
                <Icon />
              </ButtonIcon>
            )}
          </LinkButton>
        </PopoverTrigger>

        <PopoverContent>
          <LinkMain
            url={url}
            setUrl={setUrl}
            setLink={handleSetLink}
            removeLink={removeLink}
            openLink={openLink}
            isActive={isActive}
          />
        </PopoverContent>
      </Popover>
    )
  },
)

LinkPopover.displayName = "LinkPopover"
