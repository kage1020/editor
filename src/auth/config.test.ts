import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { getAuthTables } from "better-auth/db"
import { getTableColumns, type Table } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { describe, expect, it } from "vitest"
import { authConfig, authDatabaseConfig } from "./config"

/**
 * Collects the SQL the adapter sends so a query can be inspected without a
 * live D1 binding. Every statement resolves to an empty result set.
 */
function createRecordingDatabase() {
  const statements: string[] = []
  const client = {
    prepare(sql: string) {
      statements.push(sql)
      return {
        bind: () => ({
          all: async () => ({ results: [] }),
          raw: async () => [],
          run: async () => ({}),
        }),
      }
    },
  } as unknown as D1Database

  return {
    statements,
    db: drizzle(client, { schema: authDatabaseConfig.schema }),
  }
}

describe("Better Auth schema alignment", () => {
  const tables = getAuthTables(authConfig)
  const drizzleTables: Record<string, Table> = { ...authDatabaseConfig.schema }

  it.each(Object.values(tables))(
    "maps every $modelName field onto the Drizzle schema",
    (table) => {
      const drizzleTable = drizzleTables[`${table.modelName}s`]
      expect(drizzleTable).toBeDefined()

      const columns = Object.keys(getTableColumns(drizzleTable))
      expect(columns).toEqual(expect.arrayContaining(Object.keys(table.fields)))
    },
  )

  it("resolves an OAuth account to real columns", async () => {
    const { statements, db } = createRecordingDatabase()
    const adapter = drizzleAdapter(db, authDatabaseConfig)({})

    await adapter.findMany({
      model: "account",
      where: [
        { field: "providerId", value: "google" },
        { field: "accountId", value: "account-id" },
      ],
    })

    expect(statements).toHaveLength(1)
    expect(statements[0]).toContain('"accounts"."provider_id" = ?')
    expect(statements[0]).toContain('"accounts"."account_id" = ?')
  })
})
