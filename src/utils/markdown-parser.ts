/**
 * Markdown parsing utilities for Tiptap editor
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

/**
 * Check if text looks like a markdown list
 */
export function isMarkdownList(text: string): boolean {
  const lines = text.trim().split("\n")
  if (lines.length === 0) return false

  // Check if all non-empty lines are list items
  return lines.every((line) => {
    const trimmed = line.trim()
    if (trimmed === "") return true // Allow empty lines

    // Check for unordered list (-, *, +)
    if (/^[-*+]\s/.test(trimmed)) return true

    // Check for ordered list (1., 2., etc.)
    if (/^\d+\.\s/.test(trimmed)) return true

    // Check for task list (- [ ] or - [x])
    if (/^[-*+]\s\[[\sx]\]\s/.test(trimmed)) return true

    return false
  })
}

/**
 * Parse a markdown list into a structured format
 */
export function parseMarkdownList(text: string) {
  const lines = text.trim().split("\n")
  const items: Array<{
    type: "bullet" | "ordered" | "task"
    content: string
    checked?: boolean
    level: number
  }> = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === "") continue

    // Calculate indentation level (every 2 spaces = 1 level)
    const leadingSpaces = line.length - line.trimLeft().length
    const level = Math.floor(leadingSpaces / 2)

    // Check for task list
    const taskMatch = trimmed.match(/^[-*+]\s\[([\sx])\]\s(.*)/)
    if (taskMatch) {
      items.push({
        type: "task",
        content: taskMatch[2],
        checked: taskMatch[1].toLowerCase() === "x",
        level,
      })
      continue
    }

    // Check for unordered list
    const bulletMatch = trimmed.match(/^[-*+]\s(.*)/)
    if (bulletMatch) {
      items.push({
        type: "bullet",
        content: bulletMatch[1],
        level,
      })
      continue
    }

    // Check for ordered list
    const orderedMatch = trimmed.match(/^\d+\.\s(.*)/)
    if (orderedMatch) {
      items.push({
        type: "ordered",
        content: orderedMatch[1],
        level,
      })
    }
  }

  return items
}

/**
 * Check if text contains markdown images
 */
export function hasMarkdownImages(text: string): boolean {
  // Match markdown image pattern: ![alt](url) or ![alt](url "title")
  const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/
  return imagePattern.test(text)
}

/**
 * Parse markdown images from text
 */
export function parseMarkdownImages(text: string) {
  const images: Array<{
    alt: string
    src: string
    title?: string
    fullMatch: string
  }> = []

  // Match all markdown images: ![alt](url) or ![alt](url "title")
  const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g
  let match: RegExpExecArray | null = imagePattern.exec(text)

  while (match !== null) {
    const [fullMatch, alt, urlPart] = match

    // Parse URL and optional title
    const urlTitleMatch = urlPart.match(/^([^\s]+)(?:\s+"([^"]*)")?$/)
    if (urlTitleMatch) {
      const [, src, title] = urlTitleMatch
      images.push({
        alt: alt || "",
        src: src.trim(),
        title: title || undefined,
        fullMatch,
      })
    }
    match = imagePattern.exec(text)
  }

  return images
}
