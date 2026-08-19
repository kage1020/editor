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

This project uses pnpm. Install dependencies:

```bash
pnpm install
```

Then run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the editor.

### Local configuration

Secrets are read from `.dev.vars` (gitignored). Authentication needs at least:

```
BETTER_AUTH_SECRET=<any random string>
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

The editor itself runs without them; saving a document requires a signed-in
user. The local D1 database is created by `pnpm dev`; apply migrations with
`pnpm migrate`.

### Checks

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # biome check src
pnpm build       # next build
pnpm preview     # build the Worker and run it locally
```

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Editor**: Tiptap 3
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: Cloudflare D1 via Drizzle ORM
- **Auth**: Better Auth
- **Hosting**: Cloudflare Workers via OpenNext
- **Tooling**: Biome, TypeScript 7, pnpm

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
