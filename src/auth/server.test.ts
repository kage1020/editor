import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  headers: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("@/db", () => ({ getDb: mocks.getDb }))
vi.mock("next/headers", () => ({ headers: mocks.headers }))

describe("auth server", () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.getDb.mockReset()
    mocks.headers.mockReset()
  })

  it("leaves the database alone when the module is imported", async () => {
    await import("./server")

    expect(mocks.getDb).not.toHaveBeenCalled()
  })

  it("reads the request before touching the database", async () => {
    // Outside a request, as when `next build` renders a route, headers()
    // throws to mark the route dynamic.
    mocks.headers.mockRejectedValue(new Error("outside a request"))
    const { getSession } = await import("./server")

    await expect(getSession()).rejects.toThrow("outside a request")
    expect(mocks.getDb).not.toHaveBeenCalled()
  })
})
