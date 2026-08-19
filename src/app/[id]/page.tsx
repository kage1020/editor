import { Loader2 } from "lucide-react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { getDocument } from "@/db/queries"
import { Editor } from "./_components/editor"

export async function generateMetadata({
  params,
}: PageProps<"/[id]">): Promise<Metadata> {
  const document = await getDocument((await params).id)
  return { title: document?.title || "Untitled" }
}

export default async function DocumentPage({ params }: PageProps<"/[id]">) {
  const documentPromise = getDocument((await params).id)

  return (
    <Suspense
      fallback={
        <div className="max-w-[90vw] md:max-w-[70vw] mt-16 md:mt-0 mx-auto w-full py-4 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin text-gray-500" />
          </div>
        </div>
      }
    >
      <Editor documentPromise={documentPromise} />
    </Suspense>
  )
}
