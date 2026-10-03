import { Details as DetailsBase } from "@tiptap/extension-details"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    detailsToggle: {
      toggleDetails: () => ReturnType
    }
  }
}

export const Details = DetailsBase.extend({
  addCommands() {
    return {
      ...this.parent?.(),
      toggleDetails:
        () =>
        ({ editor, commands }) =>
          editor.isActive(this.name)
            ? commands.unsetDetails()
            : commands.setDetails(),
    }
  },

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      "Mod-Shift-d": () => this.editor.commands.toggleDetails(),
    }
  },
})

export default Details
