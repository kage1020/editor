"use client"

import { useSyncExternalStore } from "react"
import { z } from "zod"

export const COLLAPSED_GROUPS_STORAGE_KEY = "sidebar:collapsed-groups"

const storedIdsSchema = z.array(z.string())
const NONE_COLLAPSED: ReadonlySet<string> = new Set()

const listeners = new Set<() => void>()
// Holds the latest value when the browser refuses to store it, so toggling
// still works for the rest of the session.
let unpersistedRaw: string | null | undefined
let snapshotRaw: string | null | undefined
let snapshot = NONE_COLLAPSED

function readRaw() {
  if (unpersistedRaw !== undefined) return unpersistedRaw
  try {
    return window.localStorage.getItem(COLLAPSED_GROUPS_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeRaw(raw: string | null) {
  try {
    if (raw === null) {
      window.localStorage.removeItem(COLLAPSED_GROUPS_STORAGE_KEY)
    } else {
      window.localStorage.setItem(COLLAPSED_GROUPS_STORAGE_KEY, raw)
    }
    unpersistedRaw = undefined
  } catch {
    unpersistedRaw = raw
  }
  for (const listener of listeners) listener()
}

function parse(raw: string | null): ReadonlySet<string> {
  if (raw === null) return NONE_COLLAPSED
  try {
    const result = storedIdsSchema.safeParse(JSON.parse(raw))
    return result.success ? new Set(result.data) : NONE_COLLAPSED
  } catch {
    return NONE_COLLAPSED
  }
}

function getSnapshot() {
  const raw = readRaw()
  if (raw !== snapshotRaw) {
    snapshotRaw = raw
    snapshot = parse(raw)
  }
  return snapshot
}

function getServerSnapshot() {
  return NONE_COLLAPSED
}

function onStorage(event: StorageEvent) {
  // A null key means another tab cleared the whole storage.
  if (event.key === null || event.key === COLLAPSED_GROUPS_STORAGE_KEY) {
    for (const listener of listeners) listener()
  }
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener("storage", onStorage)
  }
}

function save(ids: ReadonlySet<string>) {
  writeRaw(ids.size === 0 ? null : JSON.stringify([...ids]))
}

function toggleGroup(groupId: string) {
  const next = new Set(getSnapshot())
  if (!next.delete(groupId)) next.add(groupId)
  save(next)
}

function forgetGroup(groupId: string) {
  const current = getSnapshot()
  if (!current.has(groupId)) return
  const next = new Set(current)
  next.delete(groupId)
  save(next)
}

export function useCollapsedGroups() {
  const collapsedGroupIds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )
  return { collapsedGroupIds, toggleGroup, forgetGroup }
}
