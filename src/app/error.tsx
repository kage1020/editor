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
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
        エラーが発生しました
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        申し訳ございません。問題が発生しました。
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>再試行</Button>
        <Button variant="outline" asChild>
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    </div>
  )
}
