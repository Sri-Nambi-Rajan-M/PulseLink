import { defineConfig, loadEnv, type UserConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  const isDevBuild = command === "build" && mode === "development";

  const plugins = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Fail fast if server-only code leaks into a client bundle.
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      // Route TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
    }),
    viteReact(),
  ];

  // Build-only: nitro is what actually produces the deployable server
  // output. Kept optional (try/catch) so a local `vite build` without the
  // `nitro` package installed doesn't hard-fail — matches the previous
  // config's own fallback behavior.
  if (command === "build") {
    try {
      const { nitro } = await import("nitro/vite");
      plugins.push(nitro({ defaultPreset: "node-server" }));
    } catch {
      console.warn(
        "[vite.config] `nitro` package not found — building without the nitro/server adapter.",
      );
    }
  }

  // Dev-only: TanStack's own devtools overlay.
  if (mode === "development") {
    try {
      const { devtools } = await import("@tanstack/devtools-vite");
      plugins.push(
        devtools({
          logging: false,
          eventBusConfig: { enabled: false },
          enhancedLogs: { enabled: false },
          consolePiping: { enabled: false },
          removeDevtoolsOnBuild: false,
          injectSource: { enabled: true },
        }),
      );
    } catch {
      // Devtools package not installed — skip silently, it's optional tooling.
    }
  }

  // Inject VITE_*-prefixed env vars as import.meta.env.* replacements at build time.
  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(loadedEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    define: envDefine,
    ...(isDevBuild
      ? {
          // Client-scoped so React DevTools gets the dev react-dom build; a
          // global NODE_ENV flip would emit jsxDEV, which the SSR runtime
          // can't resolve.
          environments: {
            client: { define: { "process.env.NODE_ENV": JSON.stringify("development") } },
          },
        }
      : {}),
    // Vite uses PostCSS in dev and Lightning CSS at build by default; forcing
    // Lightning CSS in both keeps dev preview and the built output consistent.
    css: { transformer: "lightningcss" },
    resolve: {
      alias: {
        "@": `${process.cwd()}/src`,
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    server: {
      host: "::",
      port: 8080,
      // Without this, Vite silently picks the next free port (8081, 8082...)
      // if 8080 is taken — which is exactly what happened here: the app
      // came up fine on a different port, but the backend's CORS allowlist
      // only knows about 8080/3000, so login failed with a generic error
      // that looked like a backend problem. Failing loudly here surfaces
      // the real issue immediately instead of costing a debugging session.
      strictPort: true,
      watch: {
        awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 100 },
      },
    },
    plugins,
  };
});
