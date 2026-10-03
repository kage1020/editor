"use server"

import { getCloudflareContext } from "@opennextjs/cloudflare"
import { and, eq, exists } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { revalidatePath } from "next/cache"
import { unstable_rethrow } from "next/navigation"
import type { z } from "zod"
import { getSession } from "@/auth/server"
import { documentGroups, editorContents } from "@/db/schema"
import {
  createGroupSchema,
  deleteGroupSchema,
  moveDocumentSchema,
  renameGroupSchema,
} from "@/lib/document-groups"

export type CreateGroupInput = z.input<typeof createGroupSchema>
export type RenameGroupInput = z.input<typeof renameGroupSchema>
export type DeleteGroupInput = z.input<typeof deleteGroupSchema>
export type MoveDocumentInput = z.input<typeof moveDocumentSchema>

export type GroupActionResult =
  | { success: true; id: string }
  | { success: false; error: string; details?: unknown }

type ActionContext = {
  userId: string
  db: ReturnType<typeof drizzle>
}

/**
 * Validates the input and resolves the signed-in user before `run` sees
 * anything, so every group mutation shares the same guard and error shape.
 */
async function runGroupAction<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
  failureMessage: string,
  run: (
    data: z.output<TSchema>,
    context: ActionContext,
  ) => Promise<GroupActionResult>,
): Promise<GroupActionResult> {
  try {
    const validationResult = schema.safeParse(input)

    if (!validationResult.success) {
      return {
        success: false,
        error: "Validation failed",
        details: validationResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      }
    }

    const session = await getSession()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    const { env } = await getCloudflareContext({ async: true })
    const result = await run(validationResult.data, {
      userId,
      db: drizzle(env.DB),
    })

    if (result.success) {
      // The sidebar lives in the root layout, so every route has to refresh.
      revalidatePath("/", "layout")
    }

    return result
  } catch (error) {
    unstable_rethrow(error)
    console.error(`${failureMessage}:`, error)
    return { success: false, error: failureMessage }
  }
}

const GROUP_NOT_FOUND = "Group not found or access denied"

export async function createGroupAction(
  input: CreateGroupInput,
): Promise<GroupActionResult> {
  return runGroupAction(
    createGroupSchema,
    input,
    "Failed to create group",
    async ({ name }, { userId, db }) => {
      const [created] = await db
        .insert(documentGroups)
        .values({ name, userId })
        .returning({ id: documentGroups.id })

      return created
        ? { success: true, id: created.id }
        : { success: false, error: "Failed to create group" }
    },
  )
}

export async function renameGroupAction(
  input: RenameGroupInput,
): Promise<GroupActionResult> {
  return runGroupAction(
    renameGroupSchema,
    input,
    "Failed to rename group",
    async ({ id, name }, { userId, db }) => {
      const [renamed] = await db
        .update(documentGroups)
        .set({ name })
        .where(
          and(eq(documentGroups.id, id), eq(documentGroups.userId, userId)),
        )
        .returning({ id: documentGroups.id })

      return renamed
        ? { success: true, id: renamed.id }
        : { success: false, error: GROUP_NOT_FOUND }
    },
  )
}

export async function deleteGroupAction(
  input: DeleteGroupInput,
): Promise<GroupActionResult> {
  return runGroupAction(
    deleteGroupSchema,
    input,
    "Failed to delete group",
    async ({ id }, { userId, db }) => {
      // The foreign key already ungroups documents on delete; doing it
      // explicitly keeps that true even where foreign keys are not enforced.
      const [, deleted] = await db.batch([
        db
          .update(editorContents)
          .set({ groupId: null })
          .where(
            and(
              eq(editorContents.groupId, id),
              eq(editorContents.userId, userId),
            ),
          ),
        db
          .delete(documentGroups)
          .where(
            and(eq(documentGroups.id, id), eq(documentGroups.userId, userId)),
          )
          .returning({ id: documentGroups.id }),
      ])

      return deleted.length > 0
        ? { success: true, id }
        : { success: false, error: GROUP_NOT_FOUND }
    },
  )
}

export async function moveDocumentAction(
  input: MoveDocumentInput,
): Promise<GroupActionResult> {
  return runGroupAction(
    moveDocumentSchema,
    input,
    "Failed to move document",
    async ({ documentId, groupId }, { userId, db }) => {
      const ownsDocument = and(
        eq(editorContents.id, documentId),
        eq(editorContents.userId, userId),
      )
      const ownsTargetGroup =
        groupId === null
          ? undefined
          : exists(
              db
                .select({ id: documentGroups.id })
                .from(documentGroups)
                .where(
                  and(
                    eq(documentGroups.id, groupId),
                    eq(documentGroups.userId, userId),
                  ),
                ),
            )

      const [moved] = await db
        .update(editorContents)
        .set({ groupId })
        .where(and(ownsDocument, ownsTargetGroup))
        .returning({ id: editorContents.id })

      return moved
        ? { success: true, id: moved.id }
        : {
            success: false,
            error: "Document or group not found or access denied",
          }
    },
  )
}
