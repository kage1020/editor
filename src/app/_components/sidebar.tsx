"use client"

import { ChevronsRight } from "lucide-react"
import { use } from "react"
import { Badge } from "@/components/ui/badge"
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
import type { LoadContentResult } from "../page"

interface SidebarProps {
  contentPromise: Promise<LoadContentResult>
}

export function DocumentSidebar({ contentPromise }: SidebarProps) {
  const { documents, currentDocument } = use(contentPromise)

  const documentItems = documents.map((doc) => ({
    id: doc.id,
    title: doc.title || "Untitled",
    isCurrent: currentDocument?.id === doc.id,
    updatedAt: doc.updatedAt,
  }))

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
                {documentItems.length > 0 ? (
                  documentItems.map((doc) => (
                    <SidebarMenuItem key={doc.id}>
                      <SidebarMenuButton className="justify-between h-12">
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
                      </SidebarMenuButton>
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
