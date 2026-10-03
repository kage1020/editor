import { beforeEach, describe, expect, it, vi } from "vitest"

const USER = "user-1"
const GROUP = "6f1c1a52-0a39-4d0b-9b8e-0d6a4f3c8a01"
const DOC = "1d2e3f40-5a6b-4c7d-8e9f-0a1b2c3d4e5f"

type Statement = { sql: string; params: unknown[] }

/**
 * Stands in for the D1 binding: records every executed statement and answers
 * with the rows `respond` returns, in drizzle's array-per-row shape.
 */
function createFakeD1(respond: (sql: string) => unknown[][]) {
  const statements: Statement[] = []

  const prepare = (sql: string) => ({
    bind: (...params: unknown[]) => {
      const execute = () => {
        statements.push({ sql, params })
        return respond(sql)
      }
      return {
        raw: async () => execute(),
        all: async () => ({ results: execute() }),
        run: async () => {
          execute()
          return {}
        },
        // `batch` hands rows back as objects keyed by column.
        asBatchResult: () => ({
          results: execute().map((row) => Object.fromEntries(row.entries())),
        }),
      }
    },
  })

  const client = {
    prepare,
    batch: async (bound: { asBatchResult: () => unknown }[]) =>
      bound.map((statement) => statement.asBatchResult()),
  }

  return { statements, client }
}

const mocks = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
  db: null as unknown,
  revalidatePath: vi.fn(),
}))

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: async () => ({ env: { DB: mocks.db } }),
}))
vi.mock("@/auth/server", () => ({
  getSession: async () => mocks.session,
}))
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))

const {
  createGroupAction,
  deleteGroupAction,
  moveDocumentAction,
  renameGroupAction,
} = await import("./group")

function useDatabase(respond: (sql: string) => unknown[][] = () => []) {
  const fake = createFakeD1(respond)
  mocks.db = fake.client
  return fake.statements
}

beforeEach(() => {
  mocks.session = { user: { id: USER } }
  mocks.revalidatePath.mockClear()
})

const allActions = [
  ["createGroupAction", () => createGroupAction({ name: "Work" })],
  ["renameGroupAction", () => renameGroupAction({ id: GROUP, name: "Work" })],
  ["deleteGroupAction", () => deleteGroupAction({ id: GROUP })],
  [
    "moveDocumentAction",
    () => moveDocumentAction({ documentId: DOC, groupId: GROUP }),
  ],
] as const

describe("group actions", () => {
  it.each(allActions)("%s requires a signed-in user", async (_, run) => {
    mocks.session = null
    const statements = useDatabase()

    expect(await run()).toEqual({ success: false, error: "Unauthorized" })
    expect(statements).toEqual([])
  })

  it("rejects invalid input before touching the database", async () => {
    const statements = useDatabase()

    const results = await Promise.all([
      createGroupAction({ name: " " }),
      renameGroupAction({ id: "x", name: "Work" }),
      deleteGroupAction({ id: "x" }),
      moveDocumentAction({ documentId: "x", groupId: null }),
    ])

    for (const result of results) {
      expect(result).toMatchObject({
        success: false,
        error: "Validation failed",
      })
    }
    expect(statements).toEqual([])
  })

  it("creates a group owned by the signed-in user", async () => {
    const statements = useDatabase(() => [[GROUP]])

    const result = await createGroupAction({ name: "  Work " })

    expect(result).toEqual({ success: true, id: GROUP })
    expect(statements).toHaveLength(1)
    expect(statements[0].sql).toMatch(/^insert into "document_groups"/)
    expect(statements[0].params).toContain(USER)
    expect(statements[0].params).toContain("Work")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout")
  })

  it("renames only a group the user owns", async () => {
    const statements = useDatabase(() => [])

    const result = await renameGroupAction({ id: GROUP, name: "Hobby" })

    expect(result).toEqual({
      success: false,
      error: "Group not found or access denied",
    })
    expect(statements[0].sql).toMatch(/^update "document_groups"/)
    expect(statements[0].sql).toContain('"document_groups"."user_id" = ?')
    expect(statements[0].params).toEqual(
      expect.arrayContaining(["Hobby", GROUP, USER]),
    )
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })

  it("renames a group and refreshes the sidebar", async () => {
    useDatabase(() => [[GROUP]])

    expect(await renameGroupAction({ id: GROUP, name: "Hobby" })).toEqual({
      success: true,
      id: GROUP,
    })
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout")
  })

  it("ungroups the user's documents and deletes the group together", async () => {
    const statements = useDatabase((sql) =>
      sql.startsWith("delete") ? [[GROUP]] : [],
    )

    const result = await deleteGroupAction({ id: GROUP })

    expect(result).toEqual({ success: true, id: GROUP })
    const [ungroup, remove] = statements
    expect(ungroup.sql).toMatch(/^update "editor_contents" set "group_id" = /)
    expect(ungroup.sql).toContain('"editor_contents"."user_id" = ?')
    expect(ungroup.params).toEqual([null, GROUP, USER])
    expect(remove.sql).toMatch(/^delete from "document_groups"/)
    expect(remove.sql).toContain('"document_groups"."user_id" = ?')
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout")
  })

  it("reports a group that does not belong to the user", async () => {
    useDatabase(() => [])

    expect(await deleteGroupAction({ id: GROUP })).toEqual({
      success: false,
      error: "Group not found or access denied",
    })
    expect(mocks.revalidatePath).not.toHaveBeenCalled()
  })

  it("moves a document only into a group the same user owns", async () => {
    const statements = useDatabase(() => [[DOC]])

    const result = await moveDocumentAction({ documentId: DOC, groupId: GROUP })

    expect(result).toEqual({ success: true, id: DOC })
    expect(statements).toHaveLength(1)
    const [move] = statements
    expect(move.sql).toMatch(/^update "editor_contents" set "group_id" = \?/)
    expect(move.sql).toContain('"editor_contents"."user_id" = ?')
    expect(move.sql).toMatch(
      /exists \(select .* from "document_groups" where .*"document_groups"\."user_id" = \?/,
    )
    expect(move.params.filter((param) => param === USER)).toHaveLength(2)
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout")
  })

  it("takes a document out of its group without checking any group", async () => {
    const statements = useDatabase(() => [[DOC]])

    await moveDocumentAction({ documentId: DOC, groupId: null })

    expect(statements[0].sql).not.toContain("document_groups")
    expect(statements[0].params).toEqual([null, DOC, USER])
  })

  it("reports a document or group the user cannot use", async () => {
    useDatabase(() => [])

    expect(
      await moveDocumentAction({ documentId: DOC, groupId: GROUP }),
    ).toEqual({
      success: false,
      error: "Document or group not found or access denied",
    })
  })
})
