"use client"

import { type DragEvent, useState } from "react"

export const DOCUMENT_DRAG_TYPE = "application/x-editor-document"

const carriesDocument = (event: DragEvent) =>
  event.dataTransfer.types.includes(DOCUMENT_DRAG_TYPE)

/** Lets an element accept documents dragged out of the sidebar. */
export function useDocumentDropTarget<TElement extends HTMLElement>(
  onDropDocument: (documentId: string) => void,
) {
  const [isOver, setIsOver] = useState(false)

  const dropHandlers = {
    onDragOver: (event: DragEvent<TElement>) => {
      if (!carriesDocument(event)) return
      event.preventDefault()
      event.dataTransfer.dropEffect = "move"
      setIsOver(true)
    },
    onDragLeave: (event: DragEvent<TElement>) => {
      // Moving onto a child fires dragleave on the parent; stay highlighted.
      if (
        event.relatedTarget instanceof Node &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        return
      }
      setIsOver(false)
    },
    onDrop: (event: DragEvent<TElement>) => {
      setIsOver(false)
      const documentId = event.dataTransfer.getData(DOCUMENT_DRAG_TYPE)
      if (!documentId) return
      event.preventDefault()
      onDropDocument(documentId)
    },
  }

  return { isOver, dropHandlers }
}
