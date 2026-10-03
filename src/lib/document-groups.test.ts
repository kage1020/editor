import { describe, expect, it } from "vitest"
import {
  createGroupSchema,
  GROUP_NAME_MAX_LENGTH,
  groupDocuments,
  moveDocumentSchema,
  renameGroupSchema,
} from "./document-groups"

const WORK = "6f1c1a52-0a39-4d0b-9b8e-0d6a4f3c8a01"
const HOBBY = "6f1c1a52-0a39-4d0b-9b8e-0d6a4f3c8a02"
const DOC = "1d2e3f40-5a6b-4c7d-8e9f-0a1b2c3d4e5f"

const doc = (id: string, groupId: string | null) => ({
  id,
  title: id,
  updatedAt: new Date(0),
  groupId,
})

describe("groupDocuments", () => {
  it("orders groups by name, comparing digits numerically", () => {
    const sections = groupDocuments(
      [],
      [
        { id: "c", name: "Group 10" },
        { id: "a", name: "Group 2" },
        { id: "b", name: "Archive" },
      ],
    )

    expect(sections.groups.map((group) => group.name)).toEqual([
      "Archive",
      "Group 2",
      "Group 10",
    ])
  })

  it("keeps groups that have no documents", () => {
    const sections = groupDocuments([], [{ id: WORK, name: "Work" }])

    expect(sections.groups).toEqual([{ id: WORK, name: "Work", documents: [] }])
  })

  it("places each document in its group, preserving the given order", () => {
    const documents = [doc("new", WORK), doc("hobby", HOBBY), doc("old", WORK)]

    const sections = groupDocuments(documents, [
      { id: WORK, name: "Work" },
      { id: HOBBY, name: "Hobby" },
    ])

    expect(sections.groups).toEqual([
      { id: HOBBY, name: "Hobby", documents: [documents[1]] },
      { id: WORK, name: "Work", documents: [documents[0], documents[2]] },
    ])
    expect(sections.ungrouped).toEqual([])
  })

  it("leaves documents without a group ungrouped", () => {
    const documents = [doc("loose", null)]

    expect(groupDocuments(documents, []).ungrouped).toEqual(documents)
  })

  it("treats a document pointing at an unknown group as ungrouped", () => {
    const documents = [doc("orphan", WORK)]

    const sections = groupDocuments(documents, [{ id: HOBBY, name: "Hobby" }])

    expect(sections.ungrouped).toEqual(documents)
    expect(sections.groups[0].documents).toEqual([])
  })
})

describe("group name validation", () => {
  it("trims surrounding whitespace", () => {
    expect(createGroupSchema.parse({ name: "  Work  " })).toEqual({
      name: "Work",
    })
  })

  it("rejects a name that is empty once trimmed", () => {
    expect(createGroupSchema.safeParse({ name: "   " }).success).toBe(false)
    expect(renameGroupSchema.safeParse({ id: WORK, name: "" }).success).toBe(
      false,
    )
  })

  it(`rejects names longer than ${GROUP_NAME_MAX_LENGTH} characters`, () => {
    const atLimit = "あ".repeat(GROUP_NAME_MAX_LENGTH)

    expect(createGroupSchema.safeParse({ name: atLimit }).success).toBe(true)
    expect(createGroupSchema.safeParse({ name: `${atLimit}あ` }).success).toBe(
      false,
    )
  })

  it("requires a UUID to rename a group", () => {
    expect(
      renameGroupSchema.safeParse({ id: "not-a-uuid", name: "Work" }).success,
    ).toBe(false)
  })
})

describe("moveDocumentSchema", () => {
  it("accepts null to take a document out of its group", () => {
    expect(
      moveDocumentSchema.parse({ documentId: DOC, groupId: null }),
    ).toEqual({ documentId: DOC, groupId: null })
  })

  it("rejects identifiers that are not UUIDs", () => {
    expect(
      moveDocumentSchema.safeParse({ documentId: "x", groupId: WORK }).success,
    ).toBe(false)
    expect(
      moveDocumentSchema.safeParse({ documentId: DOC, groupId: "x" }).success,
    ).toBe(false)
  })
})
