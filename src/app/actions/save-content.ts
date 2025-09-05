"use server"

import { getCloudflareContext } from "@opennextjs/cloudflare"
import { desc, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSession } from "@/auth/server"
import { editorContents } from "@/db/schema"

// Zod schema for validation
const saveContentSchema = z.object({
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .refine((val) => val.trim().length > 0, {
      message: "Content cannot be only whitespace",
    }),
  json: z.record(z.string(), z.unknown()).refine(
    (val) => {
      try {
        JSON.stringify(val)
        return true
      } catch {
        return false
      }
    },
    { message: "Invalid JSON object that cannot be stringified" },
  ),
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

export async function saveContentAction(
  input: SaveContentInput,
): Promise<SaveContentResult> {
  try {
    // Validate input
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

    const { content, json, title } = validationResult.data

    // Check content size (limit to 10MB)
    const contentSize = new Blob([content]).size
    if (contentSize > 10 * 1024 * 1024) {
      return {
        success: false,
        error: "Content size exceeds 10MB limit",
      }
    }

    // Get user session
    const session = await getSession()
    const userId = session?.user?.id || null

    // Get D1 database binding
    const { env } = await getCloudflareContext({ async: true })
    const db = drizzle(env.DB)

    // Check if user already has content saved
    let existingContent = null
    if (userId) {
      const existing = await db
        .select()
        .from(editorContents)
        .where(eq(editorContents.userId, userId))
        .orderBy(desc(editorContents.updatedAt))
        .limit(1)

      if (existing.length > 0) {
        existingContent = existing[0]
      }
    }

    // If existing content for user, update it; otherwise create new
    const result = existingContent
      ? await db
          .update(editorContents)
          .set({
            content,
            json: JSON.stringify(json),
            title,
            updatedAt: new Date(),
          })
          .where(eq(editorContents.id, existingContent.id))
          .returning()
      : await db
          .insert(editorContents)
          .values({
            content,
            json: JSON.stringify(json),
            title,
            userId,
          })
          .returning()

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Failed to save content to database",
      }
    }

    revalidatePath("/")

    return {
      success: true,
      id: result[0].id,
      message: "Content saved successfully",
    }
  } catch (error) {
    console.error("Error saving content:", error)
    return {
      success: false,
      error: "Failed to save content",
    }
  }
}
