/**
 * The worker OpenNext generates at `.open-next/worker.js`, aliased in
 * `wrangler.jsonc` so the entry point type-checks before the first build.
 */
declare module "open-next-worker" {
  const handler: Required<Pick<ExportedHandler<CloudflareEnv>, "fetch">>
  export default handler
}
