/**
 * OpenNext types `getCloudflareContext().env` as the global `CloudflareEnv`,
 * so it takes the bindings cf generates from cloudflare.config.ts. ASSETS is
 * left out because OpenNext already declares it as optional on this interface.
 */
interface CloudflareEnv extends Omit<Cloudflare.Env, "ASSETS"> {}
