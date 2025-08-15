"use client"

import type { Editor } from "@tiptap/react"
import { forwardRef, useCallback, useId, useState } from "react"
import { TableIcon } from "@/components/tiptap-icons/table-icon"
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"
import { Input, InputGroup } from "@/components/tiptap-ui-primitive/input"
import { Label } from "@/components/tiptap-ui-primitive/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

export interface TablePopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Maximum number of rows in the grid selector.
   * @default 10
   */
  maxRows?: number
  /**
   * Maximum number of columns in the grid selector.
   * @default 10
   */
  maxCols?: number
  /**
   * Callback when a table is inserted.
   */
  onTableInsert?: (rows: number, cols: number) => void
}

export interface TablePopoverProps
  extends Omit<ButtonProps, "type">,
    Pick<TablePopoverContentProps, "maxRows" | "maxCols" | "onTableInsert"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether to hide the button when the table functionality is unavailable.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback for when the popover opens or closes.
   */
  onOpenChange?: (isOpen: boolean) => void
}

/**
 * Table button component for triggering the table popover
 */
export const TablePopoverButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        type="button"
        className={className}
        data-style="ghost"
        data-appearance="default"
        role="button"
        tabIndex={-1}
        aria-label="Insert table"
        tooltip="Insert table"
        ref={ref}
        {...props}
      >
        {children ?? <TableIcon className="tiptap-button-icon" />}
      </Button>
    )
  },
)

TablePopoverButton.displayName = "TablePopoverButton"

/**
 * Table grid selector component
 */
const TableGridSelector = ({
  maxRows = 10,
  maxCols = 10,
  onSelect,
}: {
  maxRows: number
  maxCols: number
  onSelect: (rows: number, cols: number) => void
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: number
    col: number
  } | null>(null)

  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({ row, col })
  }

  const handleCellClick = (row: number, col: number) => {
    onSelect(row + 1, col + 1)
  }

  return (
    <div className="table-grid-selector">
      <div className="table-grid">
        {Array.from({ length: maxRows }, (_, rowIndex) => (
          <div key={rowIndex} className="table-grid-row">
            {Array.from({ length: maxCols }, (_, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                className={`table-grid-cell ${
                  hoveredCell &&
                  rowIndex <= hoveredCell.row &&
                  colIndex <= hoveredCell.col
                    ? "highlighted"
                    : ""
                }`}
                onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                aria-label={`Insert ${rowIndex + 1}x${colIndex + 1} table`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="table-grid-info">
        {hoveredCell
          ? `${hoveredCell.row + 1} � ${hoveredCell.col + 1}`
          : "Select table size"}
      </div>
    </div>
  )
}

/**
 * Main content component for the table popover
 */
export function TablePopoverContent({
  editor,
  maxRows = 10,
  maxCols = 10,
  onTableInsert,
}: TablePopoverContentProps) {
  const isMobile = useIsMobile()
  const [rows, setRows] = useState("3")
  const [cols, setCols] = useState("3")
  const rowsId = useId()
  const colsId = useId()

  const insertTable = useCallback(
    (numRows: number, numCols: number) => {
      if (!editor) return

      editor
        .chain()
        .focus()
        .insertTable({ rows: numRows, cols: numCols, withHeaderRow: true })
        .run()

      onTableInsert?.(numRows, numCols)
    },
    [editor, onTableInsert],
  )

  const handleGridSelect = useCallback(
    (numRows: number, numCols: number) => {
      insertTable(numRows, numCols)
    },
    [insertTable],
  )

  const handleManualInsert = useCallback(() => {
    const numRows = parseInt(rows, 10)
    const numCols = parseInt(cols, 10)

    if (numRows > 0 && numCols > 0) {
      insertTable(numRows, numCols)
    }
  }, [rows, cols, insertTable])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault()
      handleManualInsert()
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
        <CardItemGroup orientation="vertical">
          {/* Grid Selector */}
          <div className="table-popover-section">
            <TableGridSelector
              maxRows={maxRows}
              maxCols={maxCols}
              onSelect={handleGridSelect}
            />
          </div>

          <Separator />

          {/* Manual Input */}
          <div className="table-popover-section">
            <div className="table-input-group">
              <div className="table-input-item">
                <Label htmlFor={rowsId}>Rows</Label>
                <InputGroup>
                  <Input
                    id={rowsId}
                    type="number"
                    min="1"
                    max="50"
                    value={rows}
                    onChange={(e) => setRows(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="3"
                  />
                </InputGroup>
              </div>

              <div className="table-input-item">
                <Label htmlFor={colsId}>Columns</Label>
                <InputGroup>
                  <Input
                    id={colsId}
                    type="number"
                    min="1"
                    max="50"
                    value={cols}
                    onChange={(e) => setCols(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="3"
                  />
                </InputGroup>
              </div>
            </div>

            <ButtonGroup orientation="horizontal">
              <Button
                type="button"
                onClick={handleManualInsert}
                disabled={
                  !rows ||
                  !cols ||
                  parseInt(rows, 10) <= 0 ||
                  parseInt(cols, 10) <= 0
                }
                data-style="ghost"
              >
                Insert Table
              </Button>
            </ButtonGroup>
          </div>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

/**
 * Table popover component for Tiptap editors.
 */
export function TablePopover({
  editor: providedEditor,
  maxRows = 10,
  maxCols = 10,
  hideWhenUnavailable = false,
  onTableInsert,
  onOpenChange,
  ...props
}: TablePopoverProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)

  const canInsertTable =
    editor?.can().insertTable({ rows: 1, cols: 1 }) ?? false

  const handleOnOpenChange = useCallback(
    (nextIsOpen: boolean) => {
      setIsOpen(nextIsOpen)
      onOpenChange?.(nextIsOpen)
    },
    [onOpenChange],
  )

  const handleTableInsert = useCallback(
    (rows: number, cols: number) => {
      onTableInsert?.(rows, cols)
      setIsOpen(false)
    },
    [onTableInsert],
  )

  if (hideWhenUnavailable && !canInsertTable) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOnOpenChange}>
      <PopoverTrigger asChild>
        <TablePopoverButton
          disabled={!canInsertTable}
          data-disabled={!canInsertTable}
          aria-label="Insert table"
          {...props}
        >
          <TableIcon className="tiptap-button-icon" />
        </TablePopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Insert table">
        <TablePopoverContent
          editor={editor}
          maxRows={maxRows}
          maxCols={maxCols}
          onTableInsert={handleTableInsert}
        />
      </PopoverContent>
    </Popover>
  )
}

export default TablePopover
