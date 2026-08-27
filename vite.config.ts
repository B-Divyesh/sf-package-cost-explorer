import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { IncomingMessage, ServerResponse } from "node:http";

const require = createRequire(import.meta.url);
const { response: badgeResponse } = require("./api/badge/index.cjs") as {
  response(query: Record<string, string>): { status: number; headers: Record<string, string>; body: string };
};

function badgeMiddleware(request: IncomingMessage, response: ServerResponse) {
  const query = Object.fromEntries(new URL(request.url || "/badge.svg", "http://localhost").searchParams.entries());
  const badge = badgeResponse(query);
  response.writeHead(badge.status, badge.headers);
  response.end(badge.body);
}

function localBadgeWorker(): Plugin {
  return {
    name: "local-badge-worker",
    configureServer(server) { server.middlewares.use("/badge.svg", badgeMiddleware); },
    configurePreviewServer(server) { server.middlewares.use("/badge.svg", badgeMiddleware); },
  };
}

function versionedServiceWorker(buildId: string): Plugin {
  let config: ResolvedConfig;
  return {
    name: "versioned-service-worker",
    apply: "build",
    configResolved(resolved) { config = resolved; },
    transformIndexHtml(html) {
      return html.replace("</head>", `    <meta name="app-build" content="${buildId}" />\n  </head>`);
    },
    generateBundle(_options, bundle) {
      const shell = ["/", "/index.html", "/manifest.webmanifest", "/favicon.svg", "/assets/package-ledger-800.webp"];
      for (const output of Object.values(bundle)) {
        if (output.type === "chunk" && output.isEntry) shell.push(`/${output.fileName}`);
        if (output.type === "asset" && output.fileName.endsWith(".css")) shell.push(`/${output.fileName}`);
      }
      const source = `/* generated at build time: ${buildId} */
const CACHE = "package-ledger-shell-${buildId}";
const SHELL = ${JSON.stringify([...new Set(shell)])};
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("package-ledger-shell-") && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then((response) => {
      if (response.ok) caches.open(CACHE).then((cache) => cache.put("/index.html", response.clone()));
      return response;
    }).catch(() => caches.match("/index.html").then((response) => response || caches.match("/"))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
`;
      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
    writeBundle() {
      // Public files are copied after Rollup emits. Replace the static manifest
      // with a versioned start URL once the output directory is complete.
      const manifest = {
        name: "Package Cost Explorer",
        short_name: "Pkg Ledger",
        description: "A private, exports-aware npm package cost ledger.",
        start_url: `/?v=${buildId}`,
        display: "standalone",
        background_color: "#f1efe8",
        theme_color: "#f1efe8",
        icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
      };
      writeFileSync(`${config.build.outDir}/manifest.webmanifest`, JSON.stringify(manifest));
    },
  };
}

export default defineConfig(() => {
  const buildId = process.env.BUILD_REVISION || Date.now().toString(36);
  return {
  build: {
    target: "es2022",
    outDir: "dist",
    sourcemap: true,
    cssCodeSplit: true,
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
    },
  },
  plugins: [localBadgeWorker(), versionedServiceWorker(buildId)],
};
});
