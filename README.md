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

`next dev` gets its bindings from `wrangler.jsonc`, the only file Wrangler's
`getPlatformProxy` reads. Keep its compatibility settings and bindings in step
with `cloudflare.config.ts`; `src/cloudflare-config.test.ts` fails when they
differ. Local data lives in `.wrangler/state`, shared by `pnpm dev`,
`pnpm preview` and `pnpm migrate`.

Binding types are generated from `cloudflare.config.ts` into
`.cloudflare/types` by `pnpm cf-typegen`; `pnpm build` and `pnpm typecheck`
regenerate them.

### Checks

```bash
pnpm typecheck   # cf workers types && tsc --noEmit
pnpm lint        # biome check src
pnpm build       # cf workers types && next build
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

`cf build` cannot build this project: it detects Next.js and runs `next build`,
which writes no Build Output. `pnpm build:worker` runs the steps instead:
`opennextjs-cloudflare build` bundles the app into `.open-next/`, then
`cf-wrangler build`, the Wrangler delegate `cf build` runs for projects bundled
by Wrangler, wraps it with `src/worker.ts` and writes Build Output to
`.cloudflare/output/` for `cf deploy --prebuilt`. Its bundler settings are in
`wrangler.config.ts`. `opennextjs-cloudflare deploy` is not used, so enabling
an OpenNext incremental cache also needs `opennextjs-cloudflare populateCache
remote` before deploying.

cf cannot stream logs or set a single secret yet. Use
`pnpm exec wrangler tail editor` and
`pnpm exec wrangler secret put <NAME> --name editor`.

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Editor**: Tiptap 3
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: Cloudflare D1 via Drizzle ORM
- **Auth**: Better Auth
- **Hosting**: Cloudflare Workers via OpenNext
- **Tooling**: cf (Cloudflare CLI), Biome, TypeScript 7, pnpm

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
