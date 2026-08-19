import { redirect } from "next/navigation"
import { getCurrentUserId, getLatestDocumentId } from "@/db/queries"

export default async function Home() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/new")

  const latestId = await getLatestDocumentId()
  redirect(latestId ? `/${latestId}` : "/new")
}
