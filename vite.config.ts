// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

function stripRootDevtoolsSourceAttributes(): Plugin {
  return {
    name: "strip-root-devtools-source-attributes",
    apply: "serve",
    enforce: "pre",
    transform(code, id) {
      const filePath = id.split("?", 1)[0]?.replace(/\\/g, "/");
      if (!filePath?.endsWith("/src/routes/__root.tsx")) return null;

      const stripped = code.replace(/\sdata-tsd-source=(?:"[^"]*"|'[^']*')/g, "");
      return stripped === code ? null : { code: stripped, map: null };
    },
  };
}

export default defineConfig({
  // TanStack Devtools sees different transformed line offsets for the Start
  // document shell in SSR and client environments. Keep source inspection on
  // normal components, but do not serialize unstable debug metadata on the
  // hydration boundary itself.
  plugins: [stripRootDevtoolsSourceAttributes()],

  vite: {
    server: {
      port: 3001,
      allowedHosts: ["silapet.test"],
    },
  },

  nitro: {
    preset: "node-server",
  },

  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
