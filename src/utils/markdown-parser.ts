/**
 * Simple markdown table utilities for Tiptap editor
 */

/**
 * Check if text looks like a markdown table
 */
export function isMarkdownTable(text: string): boolean {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return false

  // Check if we have pipe separators
  const hasPipes = lines.every((line) => line.includes("|"))
  if (!hasPipes) return false

  // Check if second line looks like a separator (contains --- or :--: etc.)
  const separatorPattern = /^\s*\|?[\s:|-]+\|?\s*$/
  const hasHeaderSeparator = separatorPattern.test(lines[1])

  return hasHeaderSeparator
}

/**
 * Parse a markdown table into a structured format
 */
export function parseMarkdownTable(text: string) {
  const lines = text
    .trim()
    .split("\n")
    .map((line) => line.trim())

  if (lines.length < 2) {
    throw new Error("Invalid table format: minimum 2 lines required")
  }

  // Parse header row
  const headerRow = lines[0]
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell !== "")

  // Skip separator row (line 1)

  // Parse data rows
  const dataRows = lines.slice(2).map((line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell !== ""),
  )

  return {
    headers: headerRow,
    rows: dataRows,
    columnCount: headerRow.length,
  }
}
