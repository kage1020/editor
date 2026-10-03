// @vitest-environment happy-dom
import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { SidebarProvider, useSidebar } from "./sidebar"

function SidebarState() {
  const { state } = useSidebar()
  return <output>{state}</output>
}

function press(init: KeyboardEventInit) {
  act(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        ...init,
      }),
    )
  })
}

describe("sidebar keyboard shortcut", () => {
  afterEach(() => {
    cleanup()
  })

  it("toggles the sidebar with Ctrl+\\", () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarState />
      </SidebarProvider>,
    )

    press({ key: "\\", code: "Backslash", ctrlKey: true })
    expect(screen.getByRole("status").textContent).toBe("expanded")

    press({ key: "\\", code: "Backslash", ctrlKey: true })
    expect(screen.getByRole("status").textContent).toBe("collapsed")
  })

  it("leaves Ctrl+Shift+B to the editor's blockquote shortcut", () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarState />
      </SidebarProvider>,
    )

    press({ key: "B", code: "KeyB", ctrlKey: true, shiftKey: true })

    expect(screen.getByRole("status").textContent).toBe("collapsed")
  })
})
