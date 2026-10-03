import { beforeEach, describe, expect, it, vi } from "vitest"

const USER = "user-1"
const DOC = "1d2e3f40-5a6b-4c7d-8e9f-0a1b2c3d4e5f"
const OWN = `${USER}/0f8fad5b-d9cb-469f-a165-70867728950e.png`
const FOREIGN = "user-2/7c9e6679-7425-40de-944b-e07fc1f90ae7.png"

const mocks = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
  deletedRows: [] as unknown[][],
  scheduled: [] as (() => Promise<unknown>)[],
  deleteUnreferencedImages: vi.fn(
    async (_env: unknown, keys: string[]) => keys,
  ),
}))

const env = {
  DB: {
    prepare: () => ({
      bind: () => ({
        raw: async () => mocks.deletedRows,
        all: async () => ({ results: mocks.deletedRows }),
      }),
    }),
  },
  UPLOADS: {},
}

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: async () => ({ env }),
}))
vi.mock("@/auth/server", () => ({
  getSession: async () => mocks.session,
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("next/server", () => ({
  after: (task: () => Promise<unknown>) => mocks.scheduled.push(task),
}))
vi.mock("@/lib/image-cleanup", () => ({
  deleteUnreferencedImages: mocks.deleteUnreferencedImages,
}))

const { deleteContentAction } = await import("./content")

beforeEach(() => {
  mocks.session = { user: { id: USER } }
  mocks.scheduled = []
  mocks.deleteUnreferencedImages.mockClear()
})

describe("deleteContentAction", () => {
  it("cleans up the deleting user's images after the document is gone", async () => {
    mocks.deletedRows = [
      [DOC, `<img src="/api/images/${OWN}"><img src="/api/images/${FOREIGN}">`],
    ]

    const result = await deleteContentAction({ id: DOC })

    expect(result.success).toBe(true)
    expect(mocks.scheduled).toHaveLength(1)
    await mocks.scheduled[0]()
    expect(mocks.deleteUnreferencedImages).toHaveBeenCalledWith(env, [OWN])
  })

  it("schedules no cleanup when nothing was deleted", async () => {
    mocks.deletedRows = []

    const result = await deleteContentAction({ id: DOC })

    expect(result.success).toBe(false)
    expect(mocks.scheduled).toHaveLength(0)
  })
})
