import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getCloudflareContext: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: mocks.getCloudflareContext,
}))

const fakeD1 = { prepare: vi.fn(), batch: vi.fn() }

describe("getDb", () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.getCloudflareContext.mockReset()
    mocks.getCloudflareContext.mockResolvedValue({ env: { DB: fakeD1 } })
  })

  it("leaves the Cloudflare context alone when the module is imported", async () => {
    await import("./index")

    expect(mocks.getCloudflareContext).not.toHaveBeenCalled()
  })

  it("fetches the Cloudflare context once and reuses the client", async () => {
    const { getDb } = await import("./index")

    const [first, second] = await Promise.all([getDb(), getDb()])
    const third = await getDb()

    expect(mocks.getCloudflareContext).toHaveBeenCalledTimes(1)
    expect(second).toBe(first)
    expect(third).toBe(first)
  })

  it("tries again after the Cloudflare context could not be fetched", async () => {
    mocks.getCloudflareContext.mockRejectedValueOnce(new Error("unavailable"))
    const { getDb } = await import("./index")

    await expect(getDb()).rejects.toThrow("unavailable")
    await expect(getDb()).resolves.toBeDefined()
    expect(mocks.getCloudflareContext).toHaveBeenCalledTimes(2)
  })
})
