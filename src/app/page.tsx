import { Loader2 } from "lucide-react"
import { ClientOnly } from "@/components/client-only"
import { AuthButton } from "./_components/auth-button"
import { Editor } from "./_components/editor"
import { DocumentSidebar } from "./_components/sidebar"
import { ThemeToggle } from "./_components/theme-toggle"

export default function Home() {
  return (
    <>
      <DocumentSidebar />
      <AuthButton />
      <ClientOnly
        fallback={
          <div className="fixed top-20 left-4 w-12 h-12 grid place-items-center">
            <Loader2 className="animate-spin" />
          </div>
        }
      >
        <ThemeToggle />
      </ClientOnly>
      <Editor />
    </>
  )
}
