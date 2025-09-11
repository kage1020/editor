import { getCloudflareContext } from "@opennextjs/cloudflare"
import { desc, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { redirect } from "next/navigation"
import { getSession } from "@/auth/server"
import { editorContents } from "@/db/schema"

export default async function Home() {
  const session = await getSession()
  const userId = session?.user?.id || null

  if (!userId) redirect("/new")

  const { env } = await getCloudflareContext({ async: true })
  const db = drizzle(env.DB)

  const results = await db
    .select()
    .from(editorContents)
    .where(eq(editorContents.userId, userId))
    .orderBy(desc(editorContents.updatedAt))
    .limit(1)

  if (results.length === 0) {
    redirect("/new")
  } else {
    redirect(`/${results[0].id}`)
  }
}
