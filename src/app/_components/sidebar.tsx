"use client"

import { ChevronsRight, FolderPlus, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { use, useMemo, useOptimistic, useState, useTransition } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { deleteContentAction } from "@/actions/content"
import {
  createGroupAction,
  deleteGroupAction,
  moveDocumentAction,
  renameGroupAction,
} from "@/actions/group"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { DocumentSummary } from "@/db/queries"
import {
  applySidebarChange,
  type GroupSummary,
  groupDocuments,
  type SidebarChange,
} from "@/lib/document-groups"
import { cn } from "@/lib/utils"
import { GroupNameDialog } from "./group-name-dialog"
import { SidebarDocumentItem } from "./sidebar-document-item"
import { SidebarGroupSection } from "./sidebar-group-section"
import { useDocumentDropTarget } from "./use-document-drop-target"

interface SidebarProps {
  documentsPromise: Promise<DocumentSummary[]>
  groupsPromise: Promise<GroupSummary[]>
}

type GroupDialog =
  | { mode: "create"; documentIdToMove?: string }
  | { mode: "rename"; group: GroupSummary }

const documentIdSchema = z.uuid()

export function DocumentSidebar({
  documentsPromise,
  groupsPromise,
}: SidebarProps) {
  const documents = use(documentsPromise)
  const groups = use(groupsPromise)
  const serverState = useMemo(
    () => ({ documents, groups }),
    [documents, groups],
  )
  const [state, applyOptimisticChange] = useOptimistic(
    serverState,
    applySidebarChange<DocumentSummary>,
  )
  const [isPending, startTransition] = useTransition()
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<
    ReadonlySet<string>
  >(() => new Set())
  // The last dialog stays in state while closing so its contents do not
  // change during the exit animation.
  const [dialog, setDialog] = useState<GroupDialog>({ mode: "create" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [draggedDocumentId, setDraggedDocumentId] = useState<string | null>(
    null,
  )
  const pathname = usePathname()

  const currentDocumentId = useMemo(() => {
    const pathSegments = pathname.split("/")
    const potentialId = pathSegments[1]
    return documentIdSchema.safeParse(potentialId).success ? potentialId : null
  }, [pathname])

  const sections = groupDocuments(state.documents, state.groups)

  const mutate = (
    change: SidebarChange,
    action: () => Promise<
      { success: true } | { success: false; error: string }
    >,
    failureMessage: string,
  ) => {
    startTransition(async () => {
      applyOptimisticChange(change)
      try {
        const result = await action()
        if (!result.success) {
          toast.error(`${failureMessage}: ${result.error}`)
        }
      } catch (error) {
        console.error(failureMessage, error)
        toast.error(failureMessage)
      }
    })
  }

  const handleMove = (documentId: string, groupId: string | null) => {
    const document = state.documents.find(({ id }) => id === documentId)
    if (!document || document.groupId === groupId) return

    mutate(
      { type: "move-document", documentId, groupId },
      () => moveDocumentAction({ documentId, groupId }),
      "ドキュメントの移動に失敗しました",
    )
  }

  const handleDeleteDocument = (documentId: string) => {
    mutate(
      { type: "delete-document", documentId },
      () => deleteContentAction({ id: documentId }),
      "ドキュメントの削除に失敗しました",
    )
  }

  const handleDeleteGroup = (groupId: string) => {
    mutate(
      { type: "delete-group", groupId },
      () => deleteGroupAction({ id: groupId }),
      "グループの削除に失敗しました",
    )
  }

  const openDialog = (next: GroupDialog) => {
    setDialog(next)
    setIsDialogOpen(true)
  }

  const toggleGroup = (groupId: string) => {
    setCollapsedGroupIds((current) => {
      const next = new Set(current)
      if (!next.delete(groupId)) next.add(groupId)
      return next
    })
  }

  const createGroup = async (name: string, documentIdToMove?: string) => {
    const result = await createGroupAction({ name })
    if (result.success && documentIdToMove) {
      const moved = await moveDocumentAction({
        documentId: documentIdToMove,
        groupId: result.id,
      })
      if (!moved.success) {
        toast.error(`ドキュメントの移動に失敗しました: ${moved.error}`)
      }
    }
    return result
  }

  const renameGroup = async (groupId: string, name: string) => {
    // Runs inside the dialog's transition, which keeps the prediction alive
    // until the refreshed sidebar arrives.
    applyOptimisticChange({ type: "rename-group", groupId, name: name.trim() })
    return renameGroupAction({ id: groupId, name })
  }

  const { isOver: isOverUngrouped, dropHandlers: ungroupedDropHandlers } =
    useDocumentDropTarget<HTMLUListElement>((documentId) =>
      handleMove(documentId, null),
    )
  const isDraggingGroupedDocument = state.documents.some(
    (document) =>
      document.id === draggedDocumentId && document.groupId !== null,
  )

  const renderDocument = (document: DocumentSummary) => (
    <SidebarDocumentItem
      key={document.id}
      document={document}
      isCurrent={document.id === currentDocumentId}
      groups={sections.groups}
      disabled={isPending}
      onMove={(groupId) => handleMove(document.id, groupId)}
      onMoveToNewGroup={() =>
        openDialog({ mode: "create", documentIdToMove: document.id })
      }
      onDelete={() => handleDeleteDocument(document.id)}
      onDragStart={() => setDraggedDocumentId(document.id)}
      onDragEnd={() => setDraggedDocumentId(null)}
    />
  )

  const isEmpty = state.documents.length === 0 && state.groups.length === 0

  return (
    <>
      <div className="fixed top-4 left-4 z-[15] rounded-full bg-background">
        <SidebarTrigger asChild>
          <Button
            size="icon"
            className="h-12 w-12 flex bg-transparent text-black dark:text-neutral-200 rounded-full transition-all duration-300 ease-in-out border hover:bg-transparent border-transparent hover:border-neutral-400 hover:text-orange-500 dark:hover:bg-transparent dark:hover:text-orange-500"
          >
            <ChevronsRight className="size-6" />
          </Button>
        </SidebarTrigger>
      </div>
      <Sidebar className="ease-in-out" variant="floating">
        <SidebarHeader className="items-end">
          <SidebarTrigger asChild>
            <Button
              size="icon"
              className="h-8 w-8 bg-transparent text-black dark:text-neutral-200 hover:bg-transparent transition-all duration-300 ease-in-out hover:text-orange-500 dark:hover:text-orange-500"
            >
              <ChevronsRight className="size-6 rotate-180" />
            </Button>
          </SidebarTrigger>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="flex gap-2 mb-2">
                  <Button
                    className="flex-1 justify-start h-12"
                    variant="outline"
                    asChild
                  >
                    <Link href="/new" className="block w-full">
                      <Plus className="size-4 mr-2" />
                      New Document
                    </Link>
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 w-12"
                        aria-label="New group"
                        onClick={() => openDialog({ mode: "create" })}
                      >
                        <FolderPlus className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">New group</TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
                {sections.groups.map((group) => (
                  <SidebarGroupSection
                    key={group.id}
                    name={group.name}
                    documentCount={group.documents.length}
                    isOpen={!collapsedGroupIds.has(group.id)}
                    disabled={isPending}
                    onToggle={() => toggleGroup(group.id)}
                    onRename={() => openDialog({ mode: "rename", group })}
                    onDelete={() => handleDeleteGroup(group.id)}
                    onDropDocument={(documentId) =>
                      handleMove(documentId, group.id)
                    }
                  >
                    {group.documents.map(renderDocument)}
                  </SidebarGroupSection>
                ))}
              </SidebarMenu>
              <SidebarMenu
                {...ungroupedDropHandlers}
                className={cn(
                  "mt-1 rounded-md transition-colors",
                  isOverUngrouped &&
                    "bg-sidebar-accent ring-2 ring-orange-500/60",
                )}
              >
                {sections.ungrouped.map(renderDocument)}
                {isDraggingGroupedDocument &&
                  sections.ungrouped.length === 0 && (
                    <li className="rounded-md border border-dashed px-2 py-3 text-center text-xs text-neutral-500">
                      Drop here to remove from group
                    </li>
                  )}
                {isEmpty && (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <span className="text-neutral-400">No documents</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <p className="text-neutral-500 text-sm text-center">
            ©︎ 2025{" "}
            <a
              href="https://github.com/kage1020"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              kage1020
            </a>
          </p>
        </SidebarFooter>
      </Sidebar>
      <GroupNameDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        {...(dialog.mode === "rename"
          ? {
              title: "Rename group",
              submitLabel: "Save",
              defaultName: dialog.group.name,
              onSubmit: (name) => renameGroup(dialog.group.id, name),
            }
          : {
              title: "New group",
              submitLabel: "Create",
              onSubmit: (name) => createGroup(name, dialog.documentIdToMove),
            })}
      />
    </>
  )
}
