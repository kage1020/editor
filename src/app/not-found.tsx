import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 w-full">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
        404
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        ページが見つかりませんでした
      </p>
      <Button asChild>
        <Link href="/">ホームに戻る</Link>
      </Button>
    </div>
  )
}
