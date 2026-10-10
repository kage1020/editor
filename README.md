# @kage1020/editor

A modern rich text editor built with Tiptap on the Next.js App Router API,
served by [vinext](https://github.com/cloudflare/vinext) on Cloudflare Workers.

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

`pnpm dev` runs the app in workerd with the bindings declared in
`cloudflare.config.ts`; server code reads them with
`import { env } from "cloudflare:workers"`. Local data lives in
`.cloudflare/state`, shared by `pnpm dev`, `pnpm preview` and `pnpm migrate`.

Binding types are generated from `cloudflare.config.ts` into
`.cloudflare/types` by `pnpm cf-typegen`, and route types such as `PageProps`
into `.next/types` by `pnpm typegen`. `pnpm typecheck` regenerates both.

### Checks

```bash
pnpm typecheck   # cf workers types && vinext typegen && tsc --noEmit
pnpm lint        # biome check src
pnpm build       # cf build
pnpm preview     # build the Worker and run it locally
```

## Deployment

The Worker is described by `cloudflare.config.ts` and deployed with
[cf](https://developers.cloudflare.com/cf/), the Cloudflare CLI. Sign in with
`pnpm exec cf auth login`, or set `CLOUDFLARE_API_TOKEN`.

```bash
pnpm run deploy           # build and deploy to production
pnpm run upload           # build and upload a version without deploying it
pnpm run migrate:remote   # apply D1 migrations to the production database
```

On Workers Builds, set the deploy command to `pnpm run deploy` and the preview
command to `pnpm run upload`, and leave the build command empty. cf reads
`CLOUDFLARE_API_TOKEN`, which Workers Builds does not document among the
variables it injects; if a build cannot authenticate, add the token as a build
secret.

cf builds with Vite, where vinext and the Cloudflare Vite plugin write Build
Output to `.cloudflare/output/`. The Worker entry, `src/worker.ts`, wraps
vinext's fetch handler to add the cron handler.

cf cannot stream logs or set a single secret yet. Use
`pnpm dlx wrangler tail editor` and
`pnpm dlx wrangler secret put <NAME> --name editor`.

## Technology Stack

- **Framework**: vinext (Next.js App Router API on Vite)
- **Editor**: Tiptap 3
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: Cloudflare D1 via Drizzle ORM
- **Auth**: Better Auth
- **Hosting**: Cloudflare Workers
- **Tooling**: cf (Cloudflare CLI), Biome, TypeScript 7, pnpm

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
