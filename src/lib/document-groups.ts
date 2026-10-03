import { z } from "zod"

export const GROUP_NAME_MAX_LENGTH = 50

export type GroupSummary = {
  id: string
  name: string
}

type GroupableDocument = {
  groupId: string | null
}

export type GroupSection<TDocument> = GroupSummary & {
  documents: TDocument[]
}

export type GroupedDocuments<TDocument> = {
  groups: GroupSection<TDocument>[]
  ungrouped: TDocument[]
}

const groupNameCollator = new Intl.Collator("ja", { numeric: true })

/**
 * Splits the document list into one section per group plus the ungrouped
 * remainder. Documents keep the order they were given in.
 */
export function groupDocuments<TDocument extends GroupableDocument>(
  documents: TDocument[],
  groups: GroupSummary[],
): GroupedDocuments<TDocument> {
  const sections = groups
    .map((group) => ({ ...group, documents: [] as TDocument[] }))
    .sort((a, b) => groupNameCollator.compare(a.name, b.name))
  const sectionById = new Map(sections.map((section) => [section.id, section]))
  const ungrouped: TDocument[] = []

  for (const document of documents) {
    const section =
      document.groupId === null ? undefined : sectionById.get(document.groupId)
    if (section) {
      section.documents.push(document)
    } else {
      ungrouped.push(document)
    }
  }

  return { groups: sections, ungrouped }
}

const groupNameSchema = z
  .string()
  .trim()
  .min(1, "Group name is required")
  .max(
    GROUP_NAME_MAX_LENGTH,
    `Group name must not exceed ${GROUP_NAME_MAX_LENGTH} characters`,
  )

export const createGroupSchema = z.object({
  name: groupNameSchema,
})

export const renameGroupSchema = z.object({
  id: z.uuid(),
  name: groupNameSchema,
})

export const deleteGroupSchema = z.object({
  id: z.uuid(),
})

export const moveDocumentSchema = z.object({
  documentId: z.uuid(),
  groupId: z.uuid().nullable(),
})
