"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 w-full">
      <h1 className="text-xl leading-7 font-semibold text-foreground">
        ページを表示できなかった
      </h1>
      <p className="text-sm text-muted-foreground">
        再試行するか、ホームに戻ってほしい。
      </p>
      <div className="flex gap-2">
        <Button variant="default" onClick={reset}>
          再試行
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    </div>
  )
}
