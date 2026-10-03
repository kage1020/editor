import { desc, eq } from "drizzle-orm"
import { cache } from "react"
import { getSession } from "@/auth/server"
import { db } from "@/db"
import { documentGroups, editorContents } from "@/db/schema"
import type { GroupSummary } from "@/lib/document-groups"
import "server-only"

/**
 * A row in the document list. Deliberately carries no body: the list is
 * rendered for every request, so pulling `content` for documents nobody is
 * looking at costs Worker CPU proportional to the whole library.
 */
export type DocumentSummary = {
  id: string
  title: string
  updatedAt: Date
  groupId: string | null
}

/** The document actually open in the editor. */
export type DocumentBody = {
  id: string
  title: string
  content: string
}

/**
 * Each of these runs once per request even though the layout, generateMetadata
 * and the page all ask for the same data: `cache` deduplicates within a render
 * pass, which arbitrary async functions (unlike `fetch`) do not get for free.
 */
export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const session = await getSession()
  return session?.user?.id ?? null
})

export const listDocuments = cache(async (): Promise<DocumentSummary[]> => {
  const userId = await getCurrentUserId()
  if (!userId) return []

  return db
    .select({
      id: editorContents.id,
      title: editorContents.title,
      updatedAt: editorContents.updatedAt,
      groupId: editorContents.groupId,
    })
    .from(editorContents)
    .where(eq(editorContents.userId, userId))
    .orderBy(desc(editorContents.updatedAt))
})

export const listGroups = cache(async (): Promise<GroupSummary[]> => {
  const userId = await getCurrentUserId()
  if (!userId) return []

  return db
    .select({ id: documentGroups.id, name: documentGroups.name })
    .from(documentGroups)
    .where(eq(documentGroups.userId, userId))
})

export const getDocument = cache(
  async (id: string): Promise<DocumentBody | null> => {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const rows = await db
      .select({
        id: editorContents.id,
        title: editorContents.title,
        content: editorContents.content,
        userId: editorContents.userId,
      })
      .from(editorContents)
      .where(eq(editorContents.id, id))
      .limit(1)

    const row = rows[0]
    if (!row || row.userId !== userId) return null

    return { id: row.id, title: row.title, content: row.content }
  },
)

/** The newest document, used to pick a landing page for `/`. */
export const getLatestDocumentId = cache(async (): Promise<string | null> => {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const rows = await db
    .select({ id: editorContents.id })
    .from(editorContents)
    .where(eq(editorContents.userId, userId))
    .orderBy(desc(editorContents.updatedAt))
    .limit(1)

  return rows[0]?.id ?? null
})
