"use client"

import type { Editor } from "@tiptap/react"

import { HeadingIcon } from "@/components/tiptap-icons"

import {
  canToggle,
  headingIcons,
  isHeadingActive,
  type Level,
} from "@/components/tiptap-ui/heading-button"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

/**
 * Configuration for the heading dropdown menu functionality
 */
export interface UseHeadingDropdownMenuConfig {
  /**
   * Available heading levels to show in the dropdown
   * @default [1, 2, 3, 4, 5, 6]
   */
  levels?: Level[]
}

/**
 * Gets the currently active heading level from the available levels
 */
function getActiveHeadingLevel(
  editor: Editor | null,
  levels: Level[] = [1, 2, 3, 4, 5, 6],
): Level | undefined {
  if (!editor || !editor.isEditable) return undefined
  return levels.find((level) => isHeadingActive(editor, level))
}

/**
 * Custom hook that provides heading dropdown menu functionality for Tiptap editor
 */
export function useHeadingDropdownMenu(config?: UseHeadingDropdownMenuConfig) {
  const { levels = [1, 2, 3, 4, 5, 6] } = config || {}

  const { editor } = useTiptapEditor()

  const activeLevel = getActiveHeadingLevel(editor, levels)
  const isActive = isHeadingActive(editor)
  const canToggleState = canToggle(editor)

  return {
    activeLevel,
    isActive,
    canToggle: canToggleState,
    levels,
    label: "Heading",
    Icon: activeLevel ? headingIcons[activeLevel] : HeadingIcon,
  }
}
