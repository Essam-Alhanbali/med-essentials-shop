// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
//
// `nitro: true` force-enables the Nitro Cloudflare-module build outside the
// Lovable sandbox (e.g. Cloudflare Workers Builds / `npx wrangler deploy`),
// which is what produces the `#tanstack-router-entry` / `#tanstack-start-entry`
// virtual modules. Without it, those imports cannot be resolved during deploy.
export default defineConfig({
  nitro: true,
  tanstackStart: {
    server: { entry: "server" },
  },
});
