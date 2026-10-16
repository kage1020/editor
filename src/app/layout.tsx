import { Loader2 } from "lucide-react"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Suspense } from "react"
import { ClientOnly } from "@/components/client-only"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { listDocuments, listGroups } from "@/db/queries"
import { AuthButton } from "./_components/auth-button"
import { DocumentSidebar } from "./_components/sidebar"
import { ThemeToggle } from "./_components/theme-toggle"
import "./globals.css"

export const metadata: Metadata = {
  title: "@kage1020/editor",
  description: "A simple text editor built with Next.js and React",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const documentsPromise = listDocuments()
  const groupsPromise = listGroups()

  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className="break-words text-adjust-none text-optimize font-smoothing-antialiased"
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          <SidebarProvider defaultOpen={false}>
            <TooltipProvider>
              <Toaster />
              <Suspense
                fallback={
                  <div className="fixed top-4 left-4 z-[15] flex size-12 items-center justify-center rounded-full bg-background">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                <DocumentSidebar
                  documentsPromise={documentsPromise}
                  groupsPromise={groupsPromise}
                />
              </Suspense>
              <AuthButton />
              <ClientOnly
                fallback={
                  <div className="fixed top-4 md:top-20 left-16 md:left-4 z-[15] flex size-12 items-center justify-center rounded-full bg-background">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                <ThemeToggle />
              </ClientOnly>
              {children}
            </TooltipProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
