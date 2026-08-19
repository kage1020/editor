import { Loader2 } from "lucide-react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { getDocument } from "@/db/queries"
import { EditorLoader } from "./_components/editor-loader"

export async function generateMetadata({
  params,
}: PageProps<"/[id]">): Promise<Metadata> {
  const document = await getDocument((await params).id)
  return { title: document?.title || "Untitled" }
}

export default async function DocumentPage({ params }: PageProps<"/[id]">) {
  const { id } = await params
  const documentPromise = getDocument(id)

  return (
    <Suspense
      fallback={
        <div className="max-w-[90vw] md:max-w-[70vw] mt-16 md:mt-0 mx-auto w-full py-4 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin text-gray-500" />
          </div>
        </div>
      }
      key={id}
    >
      {/* useEditor only reads `content` when it creates the editor, so the
          editor has to be remounted to show a different document. */}
      <EditorLoader documentPromise={documentPromise} />
    </Suspense>
  )
}
