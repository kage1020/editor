import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import "./globals.css"

export const metadata: Metadata = {
  title: "@kage1020/editor",
  description: "A simple text editor built with Next.js and React",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
              {children}
            </TooltipProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
