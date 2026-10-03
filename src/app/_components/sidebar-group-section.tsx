"use client"

import { ChevronRight, Folder, FolderOpen, Pencil, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useDocumentDropTarget } from "./use-document-drop-target"

interface SidebarGroupSectionProps {
  name: string
  documentCount: number
  isOpen: boolean
  disabled: boolean
  onToggle: () => void
  onRename: () => void
  onDelete: () => void
  onDropDocument: (documentId: string) => void
  children: ReactNode
}

export function SidebarGroupSection({
  name,
  documentCount,
  isOpen,
  disabled,
  onToggle,
  onRename,
  onDelete,
  onDropDocument,
  children,
}: SidebarGroupSectionProps) {
  const { isOver, dropHandlers } =
    useDocumentDropTarget<HTMLLIElement>(onDropDocument)
  const FolderIcon = isOpen ? FolderOpen : Folder

  return (
    <SidebarMenuItem
      {...dropHandlers}
      className={cn(
        "rounded-md transition-colors",
        isOver && "bg-sidebar-accent ring-2 ring-orange-500/60",
      )}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <SidebarMenuButton
            onClick={onToggle}
            aria-expanded={isOpen}
            className="pr-8 font-medium"
          >
            <ChevronRight
              className={cn("transition-transform", isOpen && "rotate-90")}
            />
            <FolderIcon />
            <span>{name}</span>
          </SidebarMenuButton>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem disabled={disabled} onSelect={onRename}>
            <Pencil />
            Rename
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            disabled={disabled}
            onSelect={onDelete}
          >
            <Trash2 />
            Delete group
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <SidebarMenuBadge>{documentCount}</SidebarMenuBadge>
      {isOpen && (
        <SidebarMenuSub className="mr-0 pr-0">
          {documentCount > 0 ? (
            children
          ) : (
            <li className="px-2 py-2 text-xs text-neutral-400">No documents</li>
          )}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}
