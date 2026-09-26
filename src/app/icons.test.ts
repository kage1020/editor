import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const readAsset = (name: string) => readFileSync(new URL(name, import.meta.url))

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
])
const PNG_COLOR_TYPE_RGB = 2

describe("favicon.ico", () => {
  const ico = readAsset("favicon.ico")

  it("bundles 16, 32 and 48px images", () => {
    expect(ico.readUInt16LE(2)).toBe(1)
    const count = ico.readUInt16LE(4)
    // A width byte of 0 means 256px.
    const sizes = Array.from(
      { length: count },
      (_, i) => ico[6 + i * 16] || 256,
    )
    expect(sizes.sort((a, b) => a - b)).toEqual([16, 32, 48])
  })
})

describe("icon.svg", () => {
  const svg = readAsset("icon.svg").toString("utf8")

  it("is drawn on a 32px grid", () => {
    expect(svg).toMatch(/viewBox="0 0 32 32"/)
  })

  it("uses only paths and shapes so rendering does not depend on fonts", () => {
    expect(svg).not.toMatch(/<text\b/)
  })
})

describe("apple-icon.png", () => {
  const png = readAsset("apple-icon.png")

  it("is a 180px PNG", () => {
    expect(png.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true)
    expect(png.readUInt32BE(16)).toBe(180)
    expect(png.readUInt32BE(20)).toBe(180)
  })

  it("has no alpha channel because iOS fills transparency with black", () => {
    expect(png[25]).toBe(PNG_COLOR_TYPE_RGB)
  })
})
