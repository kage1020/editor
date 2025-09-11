"use client"

import { ChevronsRight, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { use, useMemo, useTransition } from "react"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
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
import { deleteContentAction, type LoadContentResult } from "../actions/content"

interface SidebarProps {
  contentPromise: Promise<LoadContentResult>
}

const documentIdSchema = z.uuid()

export function DocumentSidebar({ contentPromise }: SidebarProps) {
  const { documents } = use(contentPromise)
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()

  const currentDocumentId = useMemo(() => {
    const pathSegments = pathname.split("/")
    const potentialId = pathSegments[1]
    return documentIdSchema.safeParse(potentialId).success ? potentialId : null
  }, [pathname])

  const documentItems = documents.map((doc) => ({
    id: doc.id,
    title: doc.title || "Untitled",
    isCurrent: doc.id === currentDocumentId,
    updatedAt: doc.updatedAt,
  }))

  const handleDelete = (documentId: string) => {
    startTransition(async () => {
      try {
        const result = await deleteContentAction({ id: documentId })
        if (!result.success) {
          console.error("Failed to delete:", result.error)
        }
      } catch (error) {
        console.error("Error deleting document:", error)
      }
    })
  }

  return (
    <>
      <div className="fixed top-4 left-4">
        <SidebarTrigger asChild>
          <Button
            size="icon"
            className="h-12 w-12 flex bg-transparent text-black dark:text-neutral-200 rounded-full transition-all duration-300 ease-in-out border hover:bg-transparent border-transparent hover:border-neutral-400 hover:text-orange-500 dark:hover:bg-transparent dark:hover:text-orange-500"
          >
            <ChevronsRight className="size-6" />
          </Button>
        </SidebarTrigger>
      </div>
      <Sidebar className="ease-in-out absolute" variant="floating">
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
                <SidebarMenuItem>
                  <Button
                    className="w-full justify-start h-12 mb-2"
                    variant="outline"
                    asChild
                  >
                    <Link href="/new" className="block w-full">
                      <Plus className="size-4 mr-2" />
                      New Document
                    </Link>
                  </Button>
                </SidebarMenuItem>
                {documentItems.length > 0 ? (
                  documentItems.map((doc) => (
                    <SidebarMenuItem key={doc.id}>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <SidebarMenuButton
                            className="justify-between h-12"
                            asChild
                          >
                            <Link href={`/${doc.id}`}>
                              <div className="flex flex-col items-start min-w-0">
                                <span className="text-ellipsis whitespace-nowrap overflow-hidden text-sm font-medium">
                                  {doc.title}
                                </span>
                                <span className="text-xs text-neutral-500">
                                  {doc.updatedAt.toLocaleDateString()}
                                </span>
                              </div>
                              {doc.isCurrent && (
                                <Badge variant="secondary" className="ml-2">
                                  Current
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </SidebarMenuItem>
                  ))
                ) : (
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
    </>
  )
}
