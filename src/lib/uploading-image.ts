import type { EditorState, Transaction } from "@tiptap/pm/state"

function imagePositions(state: EditorState, src: string): number[] {
  const positions: number[] = []
  state.doc.descendants((node, pos) => {
    if (node.type.name === "image" && node.attrs.src === src) {
      positions.push(pos)
    }
  })
  return positions
}

/**
 * Swaps a local preview for the uploaded URL. The swap stays out of the undo
 * history so that undo removes the image instead of reverting to the preview.
 */
export function replaceImageSource(
  state: EditorState,
  from: string,
  to: string,
): Transaction | null {
  const positions = imagePositions(state, from)
  if (positions.length === 0) return null

  const tr = state.tr
  for (const pos of positions) {
    tr.setNodeAttribute(pos, "src", to)
  }
  return tr.setMeta("addToHistory", false)
}

export function removeImagesWithSource(
  state: EditorState,
  src: string,
): Transaction | null {
  const positions = imagePositions(state, src)
  if (positions.length === 0) return null

  const tr = state.tr
  // Deleting from the end keeps the earlier positions valid.
  for (const pos of positions.reverse()) {
    const node = state.doc.nodeAt(pos)
    if (node) tr.delete(pos, pos + node.nodeSize)
  }
  return tr.setMeta("addToHistory", false)
}
