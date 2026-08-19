"use client"

import { Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import type { DocumentBody } from "@/db/queries"

/**
 * The editor is configured with `immediatelyRender: false`, so it produces
 * nothing during server rendering — but Tiptap, its ProseMirror extensions,
 * the Shiki grammars, KaTeX and the emoji dataset were still bundled into the
 * Cloudflare Worker script, which has a 3 MB gzipped ceiling. Loading it
 * client-side only keeps that weight out of the Worker without changing what
 * the server was actually able to render.
 */
const Editor = dynamic(() => import("./editor").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => (
    <div className="max-w-[90vw] md:max-w-[70vw] mt-16 md:mt-0 mx-auto w-full py-4 flex items-center justify-center">
      <Loader2 className="size-8 animate-spin text-gray-500" />
    </div>
  ),
})

interface EditorLoaderProps {
  documentPromise: Promise<DocumentBody | null>
}

export function EditorLoader({ documentPromise }: EditorLoaderProps) {
  return <Editor documentPromise={documentPromise} />
}
