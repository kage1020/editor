"use server"

import { getCloudflareContext } from "@opennextjs/cloudflare"
import { desc, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSession } from "@/auth/server"
import { editorContents } from "@/db/schema"

// Types
export type Document = {
  id: string
  content: string
  json: Record<string, unknown> | null
  title: string
  updatedAt: Date
}

export type LoadContentResult = {
  documents: Document[]
  currentDocument: Document | null
}

// Save content types and schema
const saveContentSchema = z.object({
  id: z.string().optional(),
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

export async function loadContentAction(
  selectedDocumentId?: string,
): Promise<LoadContentResult> {
  try {
    const session = await getSession()
    const userId = session?.user?.id || null

    if (!userId) {
      return { documents: [], currentDocument: null }
    }

    const { env } = await getCloudflareContext({ async: true })
    const db = drizzle(env.DB)

    // Fetch all documents for the user
    const results = await db
      .select()
      .from(editorContents)
      .where(eq(editorContents.userId, userId))
      .orderBy(desc(editorContents.updatedAt))

    if (results.length === 0) {
      return { documents: [], currentDocument: null }
    }

    const documents: Document[] = results.map((item) => {
      let parsedJson: Record<string, unknown> | null
      try {
        parsedJson = JSON.parse(item.json)
      } catch (error) {
        console.error(`Failed to parse JSON for document ${item.id}:`, error)
        parsedJson = null
      }

      return {
        id: item.id,
        content: item.content,
        json: parsedJson,
        title: item.title,
        updatedAt: item.updatedAt,
      }
    })

    let currentDocument: Document | null
    if (selectedDocumentId) {
      currentDocument =
        documents.find((doc) => doc.id === selectedDocumentId) || null
    } else {
      currentDocument = documents[0] || null
    }

    return {
      documents,
      currentDocument,
    }
  } catch (error) {
    console.error("Error loading content:", error)
    return { documents: [], currentDocument: null }
  }
}

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

    const { id, content, json, title } = validationResult.data

    const contentSize = new Blob([content]).size
    if (contentSize > 10 * 1024 * 1024) {
      return {
        success: false,
        error: "Content size exceeds 10MB limit",
      }
    }

    const session = await getSession()
    const userId = session?.user?.id || null

    const { env } = await getCloudflareContext({ async: true })
    const db = drizzle(env.DB)

    let result:
      | {
          id: string
          userId: string | null
          content: string
          json: string
          title: string | null
          createdAt: Date
          updatedAt: Date
        }[]
      | undefined

    if (id && userId) {
      const existing = await db
        .select()
        .from(editorContents)
        .where(eq(editorContents.id, id))
        .limit(1)

      if (existing.length > 0 && existing[0].userId === userId) {
        result = await db
          .update(editorContents)
          .set({
            content,
            json: JSON.stringify(json),
            title,
            updatedAt: new Date(),
          })
          .where(eq(editorContents.id, id))
          .returning()
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
            json: JSON.stringify(json),
            title,
            userId,
          })
          .returning()
      }
    } else {
      result = await db
        .insert(editorContents)
        .values({
          content,
          json: JSON.stringify(json),
          title,
          userId,
        })
        .returning()
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
      .select()
      .from(editorContents)
      .where(eq(editorContents.id, id))
      .limit(1)

    if (existing.length === 0) {
      const newResult = await db
        .insert(editorContents)
        .values({
          content: "",
          json: JSON.stringify({}),
          title,
          userId,
        })
        .returning()

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
      .returning()

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
      .where(eq(editorContents.id, id) && eq(editorContents.userId, userId))
      .returning()

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Document not found or access denied",
      }
    }

    revalidatePath("/")

    return {
      success: true,
      message: "Document deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting content:", error)
    return {
      success: false,
      error: "Failed to delete document",
    }
  }
}
