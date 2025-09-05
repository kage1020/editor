import { getCloudflareContext } from "@opennextjs/cloudflare"
import { desc, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"
import { getSession } from "@/auth/server"
import { ClientOnly } from "@/components/client-only"
import { editorContents } from "@/db/schema"
import { AuthButton } from "./_components/auth-button"
import { Editor } from "./_components/editor"
import { DocumentSidebar } from "./_components/sidebar"
import { ThemeToggle } from "./_components/theme-toggle"

export type Document = {
  id: string
  content: string
  json: Record<string, unknown> | null
  title: string | null
  updatedAt: Date
}

export type LoadContentResult = {
  documents: Document[]
  currentDocument: Document | null
}

export async function loadContentAction(): Promise<LoadContentResult> {
  try {
    const session = await getSession()
    const userId = session?.user?.id || null

    if (!userId) {
      return { documents: [], currentDocument: null }
    }

    const { env } = await getCloudflareContext({ async: true })
    const db = drizzle(env.DB)

    // Fetch all documents for the user
    const results = await db
      .select()
      .from(editorContents)
      .where(eq(editorContents.userId, userId))
      .orderBy(desc(editorContents.updatedAt))

    if (results.length === 0) {
      return { documents: [], currentDocument: null }
    }

    // Parse JSON for each document
    const documents: Document[] = results.map((item) => {
      let parsedJson: Record<string, unknown> | null
      try {
        parsedJson = JSON.parse(item.json)
      } catch (error) {
        console.error(`Failed to parse JSON for document ${item.id}:`, error)
        parsedJson = null
      }

      return {
        id: item.id,
        content: item.content,
        json: parsedJson,
        title: item.title,
        updatedAt: item.updatedAt,
      }
    })

    // The first document is the most recent (current)
    const currentDocument = documents[0] || null

    return {
      documents,
      currentDocument,
    }
  } catch (error) {
    console.error("Error loading content:", error)
    return { documents: [], currentDocument: null }
  }
}

export default function Home() {
  const contentPromise = loadContentAction()

  return (
    <>
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
      <Suspense
        fallback={
          <div className="max-w-[90vw] md:max-w-[70vw] mt-16 md:mt-0 mx-auto w-full py-4 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
          </div>
        }
      >
        <Editor contentPromise={contentPromise} />
      </Suspense>
    </>
  )
}
