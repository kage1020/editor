import { describe, expect, it } from "vitest"
import { detectImageType, isImageFileName } from "./image-file"

const bytes = (...values: (number | string)[]) =>
  new Uint8Array(
    values.flatMap((value) =>
      typeof value === "string"
        ? [...value].map((char) => char.charCodeAt(0))
        : [value],
    ),
  )

describe("detectImageType", () => {
  it.each([
    ["image/png", bytes(0x89, "PNG", 0x0d, 0x0a, 0x1a, 0x0a, 0, 0)],
    ["image/jpeg", bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0x10)],
    ["image/gif", bytes("GIF87a", 1, 0)],
    ["image/gif", bytes("GIF89a", 1, 0)],
    ["image/webp", bytes("RIFF", 0x24, 0, 0, 0, "WEBPVP8 ")],
    ["image/avif", bytes(0, 0, 0, 0x1c, "ftypavif", 0, 0, 0, 0)],
    ["image/avif", bytes(0, 0, 0, 0x1c, "ftypavis", 0, 0, 0, 0)],
  ])("recognizes %s from its signature", (type, data) => {
    expect(detectImageType(data)).toBe(type)
  })

  it.each([
    ["SVG markup", bytes('<svg xmlns="http://www.w3.org/2000/svg"></svg>')],
    ["HTML", bytes("<!doctype html><script>")],
    ["a truncated PNG header", bytes(0x89, "PN")],
    ["a RIFF container that is not WebP", bytes("RIFF", 0, 0, 0, 0, "WAVE")],
    ["an ISO-BMFF file that is not AVIF", bytes(0, 0, 0, 0x1c, "ftypmp42")],
    ["empty input", bytes()],
  ])("rejects %s", (_, data) => {
    expect(detectImageType(data)).toBeNull()
  })
})

describe("isImageFileName", () => {
  const id = "0f8fad5b-d9cb-469f-a165-70867728950e"

  it.each(["png", "jpg", "gif", "webp", "avif"])(
    "accepts a generated name with .%s",
    (ext) => {
      expect(isImageFileName(`${id}.${ext}`)).toBe(true)
    },
  )

  it.each([
    `${id}.svg`,
    `${id}.png.html`,
    `${id}`,
    `not-a-uuid.png`,
    `../${id}.png`,
    `${id.toUpperCase()}.png`,
  ])("rejects %s", (name) => {
    expect(isImageFileName(name)).toBe(false)
  })
})
