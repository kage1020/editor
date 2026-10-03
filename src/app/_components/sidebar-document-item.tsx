"use client"

import { FolderInput, FolderPlus, Trash2 } from "lucide-react"
import Link from "next/link"
import type { DragEvent } from "react"
import { Badge } from "@/components/ui/badge"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import type { DocumentSummary } from "@/db/queries"
import type { GroupSummary } from "@/lib/document-groups"
import { DOCUMENT_DRAG_TYPE } from "./use-document-drop-target"

/** Radix radio items need a string value, so "no group" gets its own key. */
const UNGROUPED_VALUE = ""

interface SidebarDocumentItemProps {
  document: DocumentSummary
  isCurrent: boolean
  groups: GroupSummary[]
  disabled: boolean
  onMove: (groupId: string | null) => void
  onMoveToNewGroup: () => void
  onDelete: () => void
  onDragStart: () => void
  onDragEnd: () => void
}

export function SidebarDocumentItem({
  document,
  isCurrent,
  groups,
  disabled,
  onMove,
  onMoveToNewGroup,
  onDelete,
  onDragStart,
  onDragEnd,
}: SidebarDocumentItemProps) {
  const handleDragStart = (event: DragEvent<HTMLAnchorElement>) => {
    event.dataTransfer.setData(DOCUMENT_DRAG_TYPE, document.id)
    event.dataTransfer.effectAllowed = "move"
    onDragStart()
  }

  return (
    <SidebarMenuItem>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <SidebarMenuButton className="justify-between h-12" asChild>
            <Link
              href={`/${document.id}`}
              draggable
              onDragStart={handleDragStart}
              onDragEnd={onDragEnd}
            >
              <div className="flex flex-col items-start min-w-0">
                <span className="text-ellipsis whitespace-nowrap overflow-hidden text-sm font-medium max-w-full">
                  {document.title || "Untitled"}
                </span>
                <span className="text-xs text-neutral-500">
                  {document.updatedAt.toLocaleDateString()}
                </span>
              </div>
              {isCurrent && (
                <Badge variant="secondary" className="ml-2">
                  Current
                </Badge>
              )}
            </Link>
          </SidebarMenuButton>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger disabled={disabled}>
              <FolderInput />
              Move to
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="max-h-80 overflow-y-auto">
              <ContextMenuRadioGroup
                value={document.groupId ?? UNGROUPED_VALUE}
                onValueChange={(value) =>
                  onMove(value === UNGROUPED_VALUE ? null : value)
                }
              >
                <ContextMenuRadioItem value={UNGROUPED_VALUE}>
                  No group
                </ContextMenuRadioItem>
                {groups.map((group) => (
                  <ContextMenuRadioItem key={group.id} value={group.id}>
                    <span className="truncate max-w-48">{group.name}</span>
                  </ContextMenuRadioItem>
                ))}
              </ContextMenuRadioGroup>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={onMoveToNewGroup}>
                <FolderPlus />
                New group…
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            disabled={disabled}
            onSelect={onDelete}
          >
            <Trash2 />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </SidebarMenuItem>
  )
}
