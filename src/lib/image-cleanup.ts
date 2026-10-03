import { asc, gt, sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { editorContents } from "@/db/schema"
import { imageKeysIn } from "@/lib/image-file"

/**
 * An upload is inserted into the editor before the document is saved, so a
 * fresh image nobody refers to yet may still be about to be saved.
 */
export const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000

export const DOCUMENT_PAGE_SIZE = 50

/** R2 accepts at most this many keys per delete call. */
const DELETE_BATCH_SIZE = 1000

type ImageEnv = Pick<CloudflareEnv, "DB" | "UPLOADS">

async function deleteKeys(bucket: R2Bucket, keys: string[]) {
  for (let i = 0; i < keys.length; i += DELETE_BATCH_SIZE) {
    await bucket.delete(keys.slice(i, i + DELETE_BATCH_SIZE))
  }
}

/**
 * Deletes the given images unless a document still shows them. Documents of
 * every user are checked because image HTML can be copied between documents.
 */
export async function deleteUnreferencedImages(
  env: ImageEnv,
  keys: string[],
): Promise<string[]> {
  const db = drizzle(env.DB)
  const unreferenced: string[] = []

  for (const key of keys) {
    const referencing = await db
      .select({ id: editorContents.id })
      .from(editorContents)
      .where(sql`instr(${editorContents.content}, ${key}) > 0`)
      .limit(1)
    if (referencing.length === 0) unreferenced.push(key)
  }

  await deleteKeys(env.UPLOADS, unreferenced)
  return unreferenced
}

async function referencedImageKeys(env: ImageEnv): Promise<Set<string>> {
  const db = drizzle(env.DB)
  const referenced = new Set<string>()
  let after: string | null = null

  while (true) {
    const page: { id: string; content: string }[] = await db
      .select({ id: editorContents.id, content: editorContents.content })
      .from(editorContents)
      .where(after === null ? undefined : gt(editorContents.id, after))
      .orderBy(asc(editorContents.id))
      .limit(DOCUMENT_PAGE_SIZE)

    for (const { content } of page) {
      for (const key of imageKeysIn(content)) referenced.add(key)
    }
    if (page.length < DOCUMENT_PAGE_SIZE) return referenced
    after = page[page.length - 1].id
  }
}

/**
 * Deletes stored images that no document shows, sparing uploads younger than
 * `ORPHAN_GRACE_MS`. Catches what deleting a document leaves behind as well as
 * images removed by editing, never saved, or owned by a deleted user.
 */
export async function deleteOrphanImages(
  env: ImageEnv,
  now: Date,
): Promise<string[]> {
  const cutoff = now.getTime() - ORPHAN_GRACE_MS
  const candidates: string[] = []
  let cursor: string | undefined

  do {
    const listing = await env.UPLOADS.list({ cursor })
    for (const object of listing.objects) {
      if (object.uploaded.getTime() < cutoff) candidates.push(object.key)
    }
    cursor = listing.truncated ? listing.cursor : undefined
  } while (cursor)

  if (candidates.length === 0) return []

  const referenced = await referencedImageKeys(env)
  const orphans = candidates.filter((key) => !referenced.has(key))
  await deleteKeys(env.UPLOADS, orphans)
  return orphans
}
