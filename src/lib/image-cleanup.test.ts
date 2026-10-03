import { beforeEach, describe, expect, it } from "vitest"
import {
  DOCUMENT_PAGE_SIZE,
  deleteOrphanImages,
  deleteUnreferencedImages,
  ORPHAN_GRACE_MS,
} from "./image-cleanup"

const NOW = new Date("2026-10-03T00:00:00Z")
const OLD = new Date(NOW.getTime() - ORPHAN_GRACE_MS - 1)
const RECENT = new Date(NOW.getTime() - ORPHAN_GRACE_MS + 60_000)

const key = (user: string, n: number) =>
  `${user}/00000000-0000-4000-8000-${String(n).padStart(12, "0")}.png`
const img = (k: string) => `<img src="/api/images/${k}">`

type Doc = { id: string; content: string }

/**
 * Stands in for the D1 binding, answering the two queries the cleanup makes:
 * a lookup for one document containing a key, and a page of documents by id.
 */
function createFakeD1(docs: Doc[]) {
  const sorted = () => [...docs].sort((a, b) => a.id.localeCompare(b.id))
  const respond = (sql: string, params: unknown[]): unknown[][] => {
    if (sql.includes("instr(")) {
      const needle = String(params[0])
      return sorted()
        .filter((doc) => doc.content.includes(needle))
        .slice(0, 1)
        .map((doc) => [doc.id])
    }
    const limit = Number(params.at(-1))
    const after = params.length > 1 ? String(params[0]) : null
    return sorted()
      .filter((doc) => after === null || doc.id > after)
      .slice(0, limit)
      .map((doc) => [doc.id, doc.content])
  }
  return {
    prepare: (sql: string) => ({
      bind: (...params: unknown[]) => ({
        raw: async () => respond(sql, params),
        all: async () => ({ results: respond(sql, params) }),
      }),
    }),
  }
}

/** Stands in for the R2 binding, listing a few objects per page. */
function createFakeR2(objects: Map<string, Date>, pageSize = 2) {
  const deleted: string[] = []
  return {
    deleted,
    list: async (options?: { cursor?: string }) => {
      const keys = [...objects.keys()].sort()
      const start = options?.cursor ? Number(options.cursor) : 0
      const page = keys.slice(start, start + pageSize)
      const truncated = start + pageSize < keys.length
      return {
        objects: page.map((k) => ({ key: k, uploaded: objects.get(k) })),
        truncated,
        cursor: truncated ? String(start + pageSize) : undefined,
      }
    },
    delete: async (keys: string | string[]) => {
      for (const k of [keys].flat()) {
        objects.delete(k)
        deleted.push(k)
      }
    },
  }
}

function environment(docs: Doc[], objects: Map<string, Date>) {
  const bucket = createFakeR2(objects)
  return {
    bucket,
    env: {
      DB: createFakeD1(docs),
      UPLOADS: bucket,
    } as unknown as Pick<CloudflareEnv, "DB" | "UPLOADS">,
  }
}

let objects: Map<string, Date>

beforeEach(() => {
  objects = new Map()
})

describe("deleteUnreferencedImages", () => {
  it("deletes only the images no remaining document shows", async () => {
    const [unused, shared] = [key("u1", 1), key("u1", 2)]
    objects.set(unused, OLD).set(shared, OLD)
    const { env, bucket } = environment(
      [{ id: "other", content: img(shared) }],
      objects,
    )

    const deleted = await deleteUnreferencedImages(env, [unused, shared])

    expect(deleted).toEqual([unused])
    expect(bucket.deleted).toEqual([unused])
    expect(objects.has(shared)).toBe(true)
  })

  it("does nothing for an empty list", async () => {
    const { env, bucket } = environment([], objects)

    expect(await deleteUnreferencedImages(env, [])).toEqual([])
    expect(bucket.deleted).toEqual([])
  })
})

describe("deleteOrphanImages", () => {
  it("deletes old images that no document shows, across every listing page", async () => {
    const orphans = [key("u1", 1), key("u1", 2), key("u2", 3)]
    for (const k of orphans) objects.set(k, OLD)
    const { env } = environment([{ id: "a", content: "<p>text</p>" }], objects)

    const deleted = await deleteOrphanImages(env, NOW)

    expect(deleted.sort()).toEqual(orphans)
    expect(objects.size).toBe(0)
  })

  it("keeps recent uploads that may belong to a document not saved yet", async () => {
    const recent = key("u1", 1)
    objects.set(recent, RECENT)
    const { env } = environment([], objects)

    expect(await deleteOrphanImages(env, NOW)).toEqual([])
    expect(objects.has(recent)).toBe(true)
  })

  it("keeps images shown by any document, including other users' and later pages", async () => {
    const own = key("u1", 1)
    const copied = key("u2", 2)
    const orphan = key("u1", 3)
    objects.set(own, OLD).set(copied, OLD).set(orphan, OLD)
    const filler = Array.from({ length: DOCUMENT_PAGE_SIZE }, (_, i) => ({
      id: `a${String(i).padStart(4, "0")}`,
      content: "<p></p>",
    }))
    const { env } = environment(
      [
        ...filler,
        { id: "b-own", content: img(own) },
        { id: "c-other-user", content: img(copied) },
      ],
      objects,
    )

    expect(await deleteOrphanImages(env, NOW)).toEqual([orphan])
    expect([...objects.keys()].sort()).toEqual([own, copied])
  })
})
