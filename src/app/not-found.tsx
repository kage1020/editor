import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 w-full">
      <h1 className="text-xl leading-7 font-semibold text-foreground">
        ページが見つからない
      </h1>
      <p className="text-sm text-muted-foreground">
        URL が変わったか、削除された可能性がある。
      </p>
      <Button variant="outline" asChild>
        <Link href="/">ホームに戻る</Link>
      </Button>
    </div>
  )
}
