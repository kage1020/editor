import { Loader2 } from "lucide-react"
import { Suspense } from "react"
import { loadContentAction } from "@/app/actions/content"
import { Editor } from "./_components/editor"

export default async function DocumentPage({ params }: PageProps<"/[id]">) {
  const contentPromise = loadContentAction((await params).id)

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
      <Editor contentPromise={contentPromise} />
    </Suspense>
  )
}
