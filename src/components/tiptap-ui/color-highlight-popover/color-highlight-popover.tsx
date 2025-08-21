"use client"

import { forwardRef, useMemo, useRef, useState } from "react"
import { BanIcon, HighlighterIcon } from "@/components/tiptap-icons"
import {
  ColorHighlightButton,
  type HighlightColor,
  pickHighlightColorsByValue,
  type UseColorHighlightConfig,
  useColorHighlight,
} from "@/components/tiptap-ui/color-highlight-button"

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

interface ColorHighlightPopoverContentProps {
  /**
   * Optional colors to use in the highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: HighlightColor[]
}

interface ColorHighlightPopoverProps
  extends Omit<ButtonProps, "type">,
    Pick<UseColorHighlightConfig, "onApplied"> {
  /**
   * Optional colors to use in the highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: HighlightColor[]
}

const ColorHighlightPopoverButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => (
    <Button
      type="button"
      className={className}
      data-style="ghost"
      appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Highlight text"
      tooltip="Highlight"
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

ColorHighlightPopoverButton.displayName = "ColorHighlightPopoverButton"

function ColorHighlightPopoverContent({
  colors = pickHighlightColorsByValue([
    "#dcfce7",
    "#e0f2fe",
    "#ffe4e6",
    "#f3e8ff",
    "#fef9c3",
  ]),
}: ColorHighlightPopoverContentProps) {
  const { handleRemoveHighlight } = useColorHighlight({})
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const colorsRefs = useRef<(HTMLButtonElement | null)[]>([])

  const menuItems = useMemo(
    () => [...colors, { label: "Remove highlight", value: "none" }],
    [colors],
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item, index) => {
      if (!containerRef.current) return false
      if (colorsRefs.current[index]) colorsRefs.current[index].click()
      if (item.value === "none") handleRemoveHighlight()
    },
    autoSelectFirstItem: false,
  })

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
              <ColorHighlightButton
                ref={(el) => {
                  colorsRefs.current[index] = el
                }}
                key={color.value}
                highlightColor={color.value}
                tooltip={color.label}
                aria-label={`${color.label} highlight color`}
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
              onClick={handleRemoveHighlight}
              aria-label="Remove highlight"
              tooltip="Remove highlight"
              tabIndex={selectedIndex === colors.length ? 0 : -1}
              type="button"
              role="menuitem"
              data-style="ghost"
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

export function ColorHighlightPopover({
  colors = pickHighlightColorsByValue([
    "#dcfce7",
    "#e0f2fe",
    "#ffe4e6",
    "#f3e8ff",
    "#fef9c3",
  ]),
  onApplied,
  ...props
}: ColorHighlightPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { canColorHighlight, isActive, label, Icon } = useColorHighlight({
    onApplied,
  })

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ColorHighlightPopoverButton
          disabled={!canColorHighlight}
          active={isActive ? "on" : "off"}
          aria-pressed={isActive}
          aria-label={label}
          tooltip={label}
          {...props}
        >
          <IconButton>
            <Icon />
          </IconButton>
        </ColorHighlightPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Highlight colors">
        <ColorHighlightPopoverContent colors={colors} />
      </PopoverContent>
    </Popover>
  )
}
