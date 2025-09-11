import { Loader2 } from "lucide-react"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Suspense } from "react"
import { loadContentAction } from "@/actions/content"
import { ClientOnly } from "@/components/client-only"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthButton } from "./_components/auth-button"
import { DocumentSidebar } from "./_components/sidebar"
import { ThemeToggle } from "./_components/theme-toggle"
import "./globals.css"

export const metadata: Metadata = {
  title: "@kage1020/editor",
  description: "A simple text editor built with Next.js and React",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const contentPromise = loadContentAction()

  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className="break-words text-adjust-none text-optimize font-smoothing-antialiased"
    >
      <body className="transition-all duration-300 ease-in-out">
        <ThemeProvider attribute="class" defaultTheme="light">
          <SidebarProvider defaultOpen={false}>
            <TooltipProvider>
              <Toaster />
              <Suspense
                fallback={
                  <div className="fixed top-4 left-4">
                    <div className="h-12 w-12 flex items-center justify-center bg-transparent rounded-full">
                      <Loader2 className="size-6 animate-spin text-gray-500" />
                    </div>
                  </div>
                }
              >
                <DocumentSidebar contentPromise={contentPromise} />
              </Suspense>
              <AuthButton />
              <ClientOnly
                fallback={
                  <div className="fixed top-20 left-4 w-12 h-12 flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-gray-500" />
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
