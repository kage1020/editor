"use client"

import type { Editor } from "@tiptap/react"
import { useMemo } from "react"

import { ListIcon } from "@/components/tiptap-icons/list-icon"
import { ListOrderedIcon } from "@/components/tiptap-icons/list-ordered-icon"
import { ListTodoIcon } from "@/components/tiptap-icons/list-todo-icon"
import {
  canToggleList,
  isListActive,
  type ListType,
  listIcons,
} from "@/components/tiptap-ui/list-button"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

/**
 * Configuration for the list dropdown menu functionality
 */
export interface UseListDropdownMenuConfig {
  /**
   * The list types to display in the dropdown.
   * @default ["bulletList", "orderedList", "taskList"]
   */
  types?: ListType[]
}

interface ListOption {
  label: string
  type: ListType
  icon: React.ElementType
}

const listOptions: ListOption[] = [
  {
    label: "Bullet List",
    type: "bulletList",
    icon: ListIcon,
  },
  {
    label: "Ordered List",
    type: "orderedList",
    icon: ListOrderedIcon,
  },
  {
    label: "Task List",
    type: "taskList",
    icon: ListTodoIcon,
  },
]

function canToggleAnyList(
  editor: Editor | null,
  listTypes: ListType[],
): boolean {
  if (!editor || !editor.isEditable) return false
  return listTypes.some((type) => canToggleList(editor, type))
}

function isAnyListActive(
  editor: Editor | null,
  listTypes: ListType[],
): boolean {
  if (!editor || !editor.isEditable) return false
  return listTypes.some((type) => isListActive(editor, type))
}

function getFilteredListOptions(
  availableTypes: ListType[],
): typeof listOptions {
  return listOptions.filter(
    (option) => !option.type || availableTypes.includes(option.type),
  )
}

/**
 * Gets the currently active list type from the available types
 */
function getActiveListType(
  editor: Editor | null,
  availableTypes: ListType[],
): ListType | undefined {
  if (!editor || !editor.isEditable) return undefined
  return availableTypes.find((type) => isListActive(editor, type))
}

/**
 * Custom hook that provides list dropdown menu functionality for Tiptap editor
 */
export function useListDropdownMenu(config?: UseListDropdownMenuConfig) {
  const { types = ["bulletList", "orderedList", "taskList"] } = config || {}

  const { editor } = useTiptapEditor()

  const filteredLists = useMemo(() => getFilteredListOptions(types), [types])

  const canToggleAny = canToggleAnyList(editor, types)
  const isAnyActive = isAnyListActive(editor, types)
  const activeType = getActiveListType(editor, types)
  const activeList = filteredLists.find((option) => option.type === activeType)

  return {
    activeType,
    isActive: isAnyActive,
    canToggle: canToggleAny,
    types,
    filteredLists,
    label: "List",
    Icon: activeList ? listIcons[activeList.type] : ListIcon,
  }
}
