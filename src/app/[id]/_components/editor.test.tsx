// @vitest-environment happy-dom
import type { Editor as TiptapEditor } from "@tiptap/core"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { Suspense } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Editor } from "./editor"

const mocks = vi.hoisted(() => ({
  saveContentAction: vi.fn(async () => ({
    success: true as const,
    id: "1d2e3f40-5a6b-4c7d-8e9f-0a1b2c3d4e5f",
    message: "saved",
  })),
}))

vi.mock("next/navigation", () => ({
  useParams: () => ({}),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}))
vi.mock("@/auth/client", () => ({
  authClient: {
    useSession: () => ({ data: { user: { id: "user-1" } } }),
  },
}))
vi.mock("@/actions/content", () => ({
  saveContentAction: mocks.saveContentAction,
  updateTitleAction: vi.fn(async () => ({ success: true, id: "x" })),
}))

interface Keys {
  key: string
  code: string
  keyCode: number
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
}

/** Mirrors what a browser reports for the physical key press. */
function press(target: Element, keys: Keys): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key: keys.key,
    code: keys.code,
    keyCode: keys.keyCode,
    ctrlKey: keys.ctrl ?? false,
    shiftKey: keys.shift ?? false,
    altKey: keys.alt ?? false,
    bubbles: true,
    cancelable: true,
  })
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}

async function renderEditor(content: string) {
  const documentPromise = Promise.resolve({ id: "doc", title: "Doc", content })
  await act(async () => {
    render(
      <Suspense fallback={null}>
        <Editor documentPromise={documentPromise} />
      </Suspense>,
    )
  })
  const dom = await vi.waitFor(() => {
    const element = document.querySelector<HTMLElement>(".ProseMirror")
    if (!element) throw new Error("editor not mounted")
    return element
  })
  const editor = (dom as HTMLElement & { editor: TiptapEditor }).editor
  return { dom, editor }
}

function selectAllText(editor: TiptapEditor) {
  act(() => {
    editor.commands.focus()
    editor.commands.setTextSelection({
      from: 1,
      to: editor.state.doc.content.size - 1,
    })
  })
}

describe("editor keyboard shortcuts", () => {
  beforeEach(() => {
    mocks.saveContentAction.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  it("applies bold exactly once with Ctrl+B", async () => {
    const { dom, editor } = await renderEditor("<p>hello</p>")
    selectAllText(editor)

    press(dom, { key: "b", code: "KeyB", keyCode: 66, ctrl: true })

    expect(editor.getHTML()).toBe("<p><strong>hello</strong></p>")
  })

  it("turns the paragraph into a bullet list with Ctrl+Shift+8 and nothing else", async () => {
    const { dom, editor } = await renderEditor("<p>hello</p>")
    selectAllText(editor)

    press(dom, {
      key: "*",
      code: "Digit8",
      keyCode: 56,
      ctrl: true,
      shift: true,
    })

    expect(editor.getHTML()).toBe("<ul><li><p>hello</p></li></ul>")
  })

  it("reverts only the latest change with Ctrl+Z", async () => {
    const { dom, editor } = await renderEditor("<p>hello</p>")
    selectAllText(editor)
    press(dom, { key: "b", code: "KeyB", keyCode: 66, ctrl: true })
    press(dom, { key: "i", code: "KeyI", keyCode: 73, ctrl: true })

    press(dom, { key: "z", code: "KeyZ", keyCode: 90, ctrl: true })

    expect(editor.getHTML()).toBe("<p><strong>hello</strong></p>")
  })

  it("turns the paragraph into a heading with Ctrl+Alt+1", async () => {
    const { dom, editor } = await renderEditor("<p>hello</p>")
    selectAllText(editor)

    press(dom, {
      key: "1",
      code: "Digit1",
      keyCode: 49,
      ctrl: true,
      alt: true,
    })

    const blocks = editor.getJSON().content
    expect(blocks).toHaveLength(1)
    expect(blocks?.[0]).toMatchObject({
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "hello" }],
    })
  })

  it("wraps the current block in details with Ctrl+Shift+D", async () => {
    const { dom, editor } = await renderEditor("<p>hello</p>")
    selectAllText(editor)

    press(dom, {
      key: "D",
      code: "KeyD",
      keyCode: 68,
      ctrl: true,
      shift: true,
    })

    expect(editor.getJSON().content?.[0]?.type).toBe("details")
  })

  it("inserts an image upload placeholder with Ctrl+Shift+I", async () => {
    const { dom, editor } = await renderEditor("<p>hello</p>")
    act(() => {
      editor.commands.focus("end")
    })

    press(dom, {
      key: "I",
      code: "KeyI",
      keyCode: 73,
      ctrl: true,
      shift: true,
    })

    const types = editor.getJSON().content?.map((node) => node.type)
    expect(types).toContain("imageUpload")
  })

  it("applies a single underline highlight with Ctrl+Shift+H", async () => {
    const { dom, editor } = await renderEditor("<p>hello</p>")
    selectAllText(editor)

    press(dom, {
      key: "H",
      code: "KeyH",
      keyCode: 72,
      ctrl: true,
      shift: true,
    })

    expect(editor.isActive("underlineHighlight")).toBe(true)
    expect(editor.isActive("highlight")).toBe(false)
  })

  it("saves the document with Ctrl+S from the editor instead of the browser dialog", async () => {
    const { dom, editor } = await renderEditor("<p>hello</p>")
    act(() => {
      editor.commands.focus()
    })

    const event = press(dom, {
      key: "s",
      code: "KeyS",
      keyCode: 83,
      ctrl: true,
    })

    expect(event.defaultPrevented).toBe(true)
    await vi.waitFor(() =>
      expect(mocks.saveContentAction).toHaveBeenCalledTimes(1),
    )
  })

  it("saves the document with Ctrl+S while editing the title", async () => {
    await renderEditor("<p>hello</p>")
    fireEvent.click(screen.getByRole("heading", { name: /edit title/i }))
    const input = await screen.findByPlaceholderText("Enter title...")

    const event = press(input, {
      key: "s",
      code: "KeyS",
      keyCode: 83,
      ctrl: true,
    })

    expect(event.defaultPrevented).toBe(true)
    await vi.waitFor(() =>
      expect(mocks.saveContentAction).toHaveBeenCalledTimes(1),
    )
  })

  it("leaves the document untouched when formatting keys are pressed in the title", async () => {
    const { editor } = await renderEditor("<p>hello</p>")
    selectAllText(editor)
    fireEvent.click(screen.getByRole("heading", { name: /edit title/i }))
    const input = await screen.findByPlaceholderText("Enter title...")

    press(input, { key: "b", code: "KeyB", keyCode: 66, ctrl: true })
    press(input, { key: "z", code: "KeyZ", keyCode: 90, ctrl: true })

    expect(editor.getHTML()).toBe("<p>hello</p>")
  })
})
