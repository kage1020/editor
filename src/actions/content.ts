"use server"

import { getCloudflareContext } from "@opennextjs/cloudflare"
import { and, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { revalidatePath } from "next/cache"
import { unstable_rethrow } from "next/navigation"
import { after } from "next/server"
import { z } from "zod"
import { getSession } from "@/auth/server"
import { editorContents } from "@/db/schema"
import { deleteUnreferencedImages } from "@/lib/image-cleanup"
import { imageKeysIn } from "@/lib/image-file"

const MAX_CONTENT_BYTES = 10 * 1024 * 1024

const contentEncoder = new TextEncoder()

function byteLength(value: string): number {
  return contentEncoder.encode(value).length
}

/**
 * The `json` column is NOT NULL but nothing reads it: the editor loads from
 * the stored HTML, and every export format is produced from the live editor.
 * A placeholder keeps writes valid until the column is dropped by a migration.
 */
const UNUSED_JSON_COLUMN = "{}"

// Save content types and schema
const saveContentSchema = z.object({
  id: z.string().optional(),
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .refine((val) => val.trim().length > 0, {
      message: "Content cannot be only whitespace",
    }),
  title: z
    .string()
    .max(255, "Title must not exceed 255 characters")
    .optional()
    .nullable()
    .transform((val) => val || "Untitled"),
})

export type SaveContentInput = z.input<typeof saveContentSchema>
export type SaveContentResult =
  | { success: true; id: string; message: string }
  | { success: false; error: string; details?: unknown }

const updateTitleSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .max(255, "Title must not exceed 255 characters")
    .transform((val) => val || "Untitled"),
})

export type UpdateTitleInput = z.input<typeof updateTitleSchema>
export type UpdateTitleResult =
  | { success: true; message: string; id: string }
  | { success: false; error: string; details?: unknown }

// Delete content types and schema
const deleteContentSchema = z.object({
  id: z.string().min(1, "Document ID is required"),
})

export type DeleteContentInput = z.input<typeof deleteContentSchema>
export type DeleteContentResult =
  | { success: true; message: string }
  | { success: false; error: string; details?: unknown }

export async function saveContentAction(
  input: SaveContentInput,
): Promise<SaveContentResult> {
  try {
    const validationResult = saveContentSchema.safeParse(input)

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

    const { id, content, title } = validationResult.data

    if (byteLength(content) > MAX_CONTENT_BYTES) {
      return {
        success: false,
        error: "Content size exceeds 10MB limit",
      }
    }

    const session = await getSession()
    const userId = session?.user?.id || null

    const { env } = await getCloudflareContext({ async: true })
    const db = drizzle(env.DB)

    let result: { id: string }[] | undefined

    if (id && userId) {
      const existing = await db
        .select({ userId: editorContents.userId })
        .from(editorContents)
        .where(eq(editorContents.id, id))
        .limit(1)

      if (existing.length > 0 && existing[0].userId === userId) {
        result = await db
          .update(editorContents)
          .set({
            content,
            json: UNUSED_JSON_COLUMN,
            title,
            updatedAt: new Date(),
          })
          .where(eq(editorContents.id, id))
          .returning({ id: editorContents.id })
      } else if (existing.length > 0) {
        return {
          success: false,
          error: "Document access denied",
        }
      } else {
        result = await db
          .insert(editorContents)
          .values({
            content,
            json: UNUSED_JSON_COLUMN,
            title,
            userId,
          })
          .returning({ id: editorContents.id })
      }
    } else {
      result = await db
        .insert(editorContents)
        .values({
          content,
          json: UNUSED_JSON_COLUMN,
          title,
          userId,
        })
        .returning({ id: editorContents.id })
    }

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Failed to save content to database",
      }
    }

    revalidatePath("/")
    revalidatePath("/new")
    revalidatePath(`/${result[0].id}`)

    return {
      success: true,
      id: result[0].id,
      message: "Content saved successfully",
    }
  } catch (error) {
    unstable_rethrow(error)
    console.error("Error saving content:", error)
    return {
      success: false,
      error: "Failed to save content",
    }
  }
}

export async function updateTitleAction(
  input: UpdateTitleInput,
): Promise<UpdateTitleResult> {
  try {
    const validationResult = updateTitleSchema.safeParse(input)

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

    const { id, title } = validationResult.data

    const session = await getSession()
    const userId = session?.user?.id

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    const { env } = await getCloudflareContext({ async: true })
    const db = drizzle(env.DB)

    const existing = await db
      .select({ userId: editorContents.userId })
      .from(editorContents)
      .where(eq(editorContents.id, id))
      .limit(1)

    if (existing.length === 0) {
      const newResult = await db
        .insert(editorContents)
        .values({
          content: "",
          json: UNUSED_JSON_COLUMN,
          title,
          userId,
        })
        .returning({ id: editorContents.id })

      if (!newResult || newResult.length === 0) {
        return {
          success: false,
          error: "Failed to create document",
        }
      }

      revalidatePath("/")
      revalidatePath(`/${newResult[0].id}`)

      return {
        success: true,
        message: "Document created successfully",
        id: newResult[0].id,
      }
    }

    if (existing[0].userId !== userId) {
      return {
        success: false,
        error: "Document access denied",
      }
    }

    const result = await db
      .update(editorContents)
      .set({
        title,
        updatedAt: new Date(),
      })
      .where(eq(editorContents.id, id))
      .returning({ id: editorContents.id })

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Failed to update title",
      }
    }

    revalidatePath("/")
    revalidatePath(`/${id}`)

    return {
      success: true,
      message: "Title updated successfully",
      id,
    }
  } catch (error) {
    unstable_rethrow(error)
    console.error("Error updating title:", error)
    return {
      success: false,
      error: "Failed to update title",
    }
  }
}

export async function deleteContentAction(
  input: DeleteContentInput,
): Promise<DeleteContentResult> {
  try {
    const validationResult = deleteContentSchema.safeParse(input)

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

    const { id } = validationResult.data

    const session = await getSession()
    const userId = session?.user?.id

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    const { env } = await getCloudflareContext({ async: true })
    const db = drizzle(env.DB)

    const result = await db
      .delete(editorContents)
      .where(and(eq(editorContents.id, id), eq(editorContents.userId, userId)))
      .returning({ id: editorContents.id, content: editorContents.content })

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Document not found or access denied",
      }
    }

    // Only the deleting user's own uploads are candidates; images copied in
    // from other users' documents are left to their owners.
    const ownImages = imageKeysIn(result[0].content).filter((key) =>
      key.startsWith(`${userId}/`),
    )
    if (ownImages.length > 0) {
      after(() => deleteUnreferencedImages(env, ownImages))
    }

    revalidatePath("/")

    return {
      success: true,
      message: "Document deleted successfully",
    }
  } catch (error) {
    unstable_rethrow(error)
    console.error("Error deleting content:", error)
    return {
      success: false,
      error: "Failed to delete document",
    }
  }
}
