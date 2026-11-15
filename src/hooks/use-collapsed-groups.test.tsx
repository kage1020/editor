// @vitest-environment happy-dom
import { act, cleanup, renderHook } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  COLLAPSED_GROUPS_STORAGE_KEY,
  useCollapsedGroups,
} from "./use-collapsed-groups"

const WORK = "6f1c1a52-0a39-4d0b-9b8e-0d6a4f3c8a01"
const HOBBY = "6f1c1a52-0a39-4d0b-9b8e-0d6a4f3c8a02"

const collapsedIds = (result: {
  current: ReturnType<typeof useCollapsedGroups>
}) => [...result.current.collapsedGroupIds].sort()

describe("useCollapsedGroups", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it("starts with every group open", () => {
    const { result } = renderHook(() => useCollapsedGroups())

    expect(collapsedIds(result)).toEqual([])
  })

  it("keeps a collapsed group collapsed after remounting", () => {
    const first = renderHook(() => useCollapsedGroups())
    act(() => first.result.current.toggleGroup(WORK))
    first.unmount()

    const { result } = renderHook(() => useCollapsedGroups())

    expect(collapsedIds(result)).toEqual([WORK])
  })

  it("keeps a reopened group open after remounting", () => {
    const first = renderHook(() => useCollapsedGroups())
    act(() => first.result.current.toggleGroup(WORK))
    act(() => first.result.current.toggleGroup(HOBBY))
    act(() => first.result.current.toggleGroup(WORK))
    first.unmount()

    const { result } = renderHook(() => useCollapsedGroups())

    expect(collapsedIds(result)).toEqual([HOBBY])
  })

  it("shares the state between components on the same page", () => {
    const a = renderHook(() => useCollapsedGroups())
    const b = renderHook(() => useCollapsedGroups())

    act(() => a.result.current.toggleGroup(WORK))

    expect(collapsedIds(b.result)).toEqual([WORK])
  })

  it("follows changes made in another tab", () => {
    const { result } = renderHook(() => useCollapsedGroups())

    act(() => {
      const newValue = JSON.stringify([HOBBY])
      window.localStorage.setItem(COLLAPSED_GROUPS_STORAGE_KEY, newValue)
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: COLLAPSED_GROUPS_STORAGE_KEY,
          newValue,
        }),
      )
    })

    expect(collapsedIds(result)).toEqual([HOBBY])
  })

  it("forgets a group so it no longer stays collapsed", () => {
    const first = renderHook(() => useCollapsedGroups())
    act(() => first.result.current.toggleGroup(WORK))
    act(() => first.result.current.toggleGroup(HOBBY))
    act(() => first.result.current.forgetGroup(WORK))
    first.unmount()

    const { result } = renderHook(() => useCollapsedGroups())

    expect(collapsedIds(result)).toEqual([HOBBY])
  })

  it.each([
    ["malformed JSON", "{not json"],
    ["a non-array value", JSON.stringify({ [WORK]: true })],
    ["non-string entries", JSON.stringify([1, null])],
  ])("treats %s as nothing collapsed", (_, stored) => {
    window.localStorage.setItem(COLLAPSED_GROUPS_STORAGE_KEY, stored)

    const { result } = renderHook(() => useCollapsedGroups())

    expect(collapsedIds(result)).toEqual([])
  })

  it("renders every group open on the server so hydration matches", () => {
    window.localStorage.setItem(
      COLLAPSED_GROUPS_STORAGE_KEY,
      JSON.stringify([WORK]),
    )

    function CollapsedCount() {
      const { collapsedGroupIds } = useCollapsedGroups()
      return <output>{collapsedGroupIds.size}</output>
    }

    expect(renderToString(<CollapsedCount />)).toBe("<output>0</output>")
  })
})
