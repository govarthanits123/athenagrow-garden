/**
 * Vite configuration for building the Capacitor (Android/iOS) SPA bundle.
 *
 * This is intentionally separate from vite.config.ts which drives the normal
 * TanStack Start SSR build.  Here we produce a plain client-only SPA with a
 * static index.html that Capacitor can copy into the native WebView shell.
 *
 * Usage:
 *   npm run build:capacitor          # or  vite build --config vite.capacitor.config.ts
 *   npx cap sync android
 */

import { defineConfig, loadEnv } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  // Load VITE_* env vars from .env so they are baked into the client bundle.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  const root = import.meta.dirname;

  return {
    plugins: [
      react(),
      tailwindcss(),
      tsconfigPaths({ projects: ["./tsconfig.json"] }),
    ],

    define: {
      ...envDefine,
      // Server-side code references process.env which doesn't exist in the
      // browser.  Providing an empty object prevents ReferenceErrors; the
      // VITE_* values above are the ones actually used on the client.
      "process.env": "({})",
    },

    resolve: {
      alias: {
        "@": path.resolve(root, "src"),
        // Stub out the server-only module so the build doesn't pull in
        // Node/h3 APIs that cannot run inside an Android WebView.
        "@tanstack/react-start/server": path.resolve(
          root,
          "src/stubs/react-start-server.ts",
        ),
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

    build: {
      outDir: "dist",
      emptyDir: true,
      rollupOptions: {
        input: path.resolve(root, "index.html"),
      },
    },
  };
});
