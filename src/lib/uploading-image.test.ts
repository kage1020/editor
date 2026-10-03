import { getSchema } from "@tiptap/core"
import Image from "@tiptap/extension-image"
import { EditorState } from "@tiptap/pm/state"
import StarterKit from "@tiptap/starter-kit"
import { describe, expect, it } from "vitest"
import { removeImagesWithSource, replaceImageSource } from "./uploading-image"

const schema = getSchema([StarterKit, Image])
const PREVIEW = "blob:http://localhost/preview"
const OTHER = "https://example.com/other.png"

function stateWith(...sources: string[]) {
  const doc = schema.node("doc", null, [
    schema.node("paragraph", null, [schema.text("before")]),
    ...sources.map((src) => schema.node("image", { src, alt: "shot" })),
    schema.node("paragraph", null, [schema.text("after")]),
  ])
  return EditorState.create({ schema, doc })
}

function imageSources(state: EditorState) {
  const sources: string[] = []
  state.doc.descendants((node) => {
    if (node.type.name === "image") sources.push(node.attrs.src)
  })
  return sources
}

describe("replaceImageSource", () => {
  it("points every image showing the preview at the uploaded URL, keeping other attributes", () => {
    const state = stateWith(PREVIEW, OTHER)

    const tr = replaceImageSource(state, PREVIEW, "/api/images/u/x.png")

    expect(tr).not.toBeNull()
    const next = state.apply(tr ?? state.tr)
    expect(imageSources(next)).toEqual(["/api/images/u/x.png", OTHER])
    let alt: unknown
    next.doc.descendants((node) => {
      if (node.attrs.src === "/api/images/u/x.png") alt = node.attrs.alt
    })
    expect(alt).toBe("shot")
  })

  it("keeps the swap out of the undo history", () => {
    const state = stateWith(PREVIEW)

    const tr = replaceImageSource(state, PREVIEW, "/api/images/u/x.png")

    expect(tr?.getMeta("addToHistory")).toBe(false)
  })

  it("returns null when the preview was already removed from the document", () => {
    expect(replaceImageSource(stateWith(OTHER), PREVIEW, "/x.png")).toBeNull()
  })
})

describe("removeImagesWithSource", () => {
  it("removes only the images showing the preview", () => {
    const state = stateWith(PREVIEW, OTHER, PREVIEW)

    const tr = removeImagesWithSource(state, PREVIEW)

    expect(tr).not.toBeNull()
    const next = state.apply(tr ?? state.tr)
    expect(imageSources(next)).toEqual([OTHER])
    expect(next.doc.textContent).toBe("beforeafter")
  })

  it("returns null when there is nothing to remove", () => {
    expect(removeImagesWithSource(stateWith(OTHER), PREVIEW)).toBeNull()
  })
})
