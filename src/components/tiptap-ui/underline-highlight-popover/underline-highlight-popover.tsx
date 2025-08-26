"use client"

import { forwardRef, useMemo, useRef, useState } from "react"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { BanIcon, HighlighterIcon } from "@/components/tiptap-icons"
import { UnderlineHighlightColorButton } from "@/components/tiptap-ui/underline-highlight-color-button"

import {
  Button,
  ButtonGroup,
  type ButtonProps,
  IconButton,
} from "@/components/tiptap-ui-primitive/button"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import { useMenuNavigation } from "@/hooks/use-menu-navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export interface UnderlineHighlightColor {
  label: string
  value: string
}

export const DEFAULT_UNDERLINE_HIGHLIGHT_COLORS: UnderlineHighlightColor[] = [
  { label: "Yellow", value: "#ffeb3b" },
  { label: "Green", value: "#4caf50" },
  { label: "Blue", value: "#2196f3" },
  { label: "Orange", value: "#ff9800" },
  { label: "Pink", value: "#e91e63" },
  { label: "Purple", value: "#9c27b0" },
]

interface UnderlineHighlightPopoverContentProps {
  /**
   * Optional colors to use in the underline highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: UnderlineHighlightColor[]
}

export interface UnderlineHighlightPopoverProps
  extends Omit<ButtonProps, "type"> {
  /**
   * Optional colors to use in the underline highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: UnderlineHighlightColor[]
  /**
   * Callback fired when the underline highlight is applied.
   */
  onApplied?: () => void
}

const UnderlineHighlightPopoverButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => (
    <Button
      type="button"
      className={className}
      variant="ghost"
      appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Underline highlight text"
      tooltip="Underline Highlight"
      ref={ref}
      {...props}
    >
      {children ?? (
        <IconButton>
          <HighlighterIcon />
        </IconButton>
      )}
    </Button>
  ),
)

UnderlineHighlightPopoverButton.displayName = "UnderlineHighlightPopoverButton"

function UnderlineHighlightPopoverContent({
  colors = DEFAULT_UNDERLINE_HIGHLIGHT_COLORS,
}: UnderlineHighlightPopoverContentProps) {
  const { editor } = useTiptapEditor()
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const colorsRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleRemoveUnderlineHighlight = () => {
    if (!editor) return
    editor.chain().focus().unsetUnderlineHighlight().run()
  }

  const menuItems = useMemo(
    () => [...colors, { label: "Remove underline highlight", value: "none" }],
    [colors],
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item, index) => {
      if (!containerRef.current) return false
      if (colorsRefs.current[index]) colorsRefs.current[index].click()
      if (item.value === "none") handleRemoveUnderlineHighlight()
    },
    autoSelectFirstItem: false,
  })

  if (!editor) return null

  return (
    <Card
      ref={containerRef}
      tabIndex={0}
      style={isMobile ? { boxShadow: "none", border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <CardItemGroup orientation="horizontal">
          <ButtonGroup orientation="horizontal">
            {colors.map((color, index) => (
              <UnderlineHighlightColorButton
                ref={(el) => {
                  colorsRefs.current[index] = el
                }}
                key={color.value}
                color={color.value}
                tooltip={color.label}
                aria-label={`${color.label} underline highlight color`}
                tabIndex={index === selectedIndex ? 0 : -1}
                highlighted={selectedIndex === index}
              />
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup orientation="horizontal">
            <Button
              className={cn(
                selectedIndex === colors.length &&
                  "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 not-[:disabled]:bg-neutral-200",
              )}
              onClick={handleRemoveUnderlineHighlight}
              aria-label="Remove underline highlight"
              tooltip="Remove underline highlight"
              tabIndex={selectedIndex === colors.length ? 0 : -1}
              type="button"
              role="menuitem"
              variant="ghost"
            >
              <IconButton>
                <BanIcon />
              </IconButton>
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

export function UnderlineHighlightPopover({
  colors = DEFAULT_UNDERLINE_HIGHLIGHT_COLORS,
  onApplied,
  ...props
}: UnderlineHighlightPopoverProps) {
  const { editor } = useTiptapEditor()
  const [isOpen, setIsOpen] = useState(false)

  if (!editor) return null

  const canUnderlineHighlight = editor.can().chain().focus().toggleUnderlineHighlight().run()
  const isActive = editor.isActive("underlineHighlight")

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <UnderlineHighlightPopoverButton
          disabled={!canUnderlineHighlight}
          active={isActive ? "on" : "off"}
          aria-pressed={isActive}
          aria-label="Underline highlight"
          tooltip="Underline highlight"
          {...props}
        >
          <IconButton>
            <HighlighterIcon />
          </IconButton>
        </UnderlineHighlightPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Underline highlight colors">
        <UnderlineHighlightPopoverContent colors={colors} />
      </PopoverContent>
    </Popover>
  )
}