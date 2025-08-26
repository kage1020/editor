# @kage1020/editor

A modern rich text editor built with Next.js and Tiptap.

## Features

### Text Formatting

- **Bold** (Cmd/Ctrl + B)
- *Italic* (Cmd/Ctrl + I)
- ~~Strikethrough~~ (Cmd/Ctrl + Shift + S)
- Underline (Cmd/Ctrl + U)
- Code inline (Cmd/Ctrl + E)
- Subscript/Superscript

### Highlighting

- **Color Highlight**: Full background highlighting with multiple colors
- **Underline Highlight**: Fluorescent marker-style highlighting that appears below text (Cmd/Ctrl + Shift + H)
  - Yellow, Green, Blue, Orange, Pink, Purple color options
  - 50% text overlap for authentic marker appearance

### Block Elements

- Headings (H1-H6)
- Bullet Lists
- Numbered Lists
- Task Lists with checkboxes
- Code Blocks with syntax highlighting
- Blockquotes
- Images with drag & drop support
- Horizontal Rules

### Advanced Features

- Tables with row/column management
- Links with preview
- Text alignment (left, center, right, justify)
- Font family selection
- Font size adjustment
- Text color customization
- Undo/Redo support
- Markdown paste support

## Getting Started

First, install dependencies:

```bash
npm install
# or
pnpm install
# or
bun install
```

Then run the development server:

```bash
npm run dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the editor.

## Technology Stack

- **Framework**: Next.js 15
- **Editor**: Tiptap
- **Styling**: Tailwind CSS
- **UI Components**: shadcn

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
