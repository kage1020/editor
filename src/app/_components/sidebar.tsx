"use client"

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
import { ChevronsRight } from "lucide-react"

const histories = Array.from({ length: 30 }, (_, i) => ({
  id: `${i}`,
  title: `HistoryHistoryHistoryHistory ${i + 1}`,
}))

export function DocumentSidebar() {
  const id = "10"

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
                {histories.map((history) => (
                  <SidebarMenuItem key={history.id}>
                    <SidebarMenuButton className="justify-between">
                      <span className="text-ellipsis whitespace-nowrap overflow-hidden">
                        {history.title}
                      </span>
                      {history.id === id && <Badge>Current</Badge>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
