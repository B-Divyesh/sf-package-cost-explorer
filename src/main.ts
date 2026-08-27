import "./style.css";
import { downloadPackage } from "./archive";
import { bundleEntries } from "./bundler";
import { listPublicEntries } from "./exports-map";
import { parsePackageSpec, resolveManifest } from "./package-spec";
import { countDependencies, fetchPackument, versionHistory } from "./registry";
import type { ArchivePackage, BundleMeasurement, DependencyReport, NamedMeasurement, PackageManifest, Packument, PublicEntry, VersionPoint } from "./types";

const app = document.querySelector<HTMLDivElement>("#app")!;

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);
}

function shell(content: string): string {
  return `<div class="paper">
    <header class="masthead">
      <a class="wordmark" href="/" aria-label="Package Cost Explorer home"><span aria-hidden="true">▰</span> Package Cost Explorer</a>
      <p>Browser edition <span aria-hidden="true">·</span> No lookup limits <span class="edition">Vol. 01 / 2026</span></p>
    </header>
    ${content}
    <footer class="footer">
      <p>Measurements stay in your browser. No accounts, analytics, or lookup logs.</p>
      <nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://github.com/B-Divyesh/sf-package-cost-explorer">Source</a></nav>
      <p class="generated-note">Hero artwork was generated for this project with Azure OpenAI.</p>
    </footer>
  </div>`;
}

function renderLegal(kind: "privacy" | "terms") {
  const privacy = kind === "privacy";
  document.title = `${privacy ? "Privacy" : "Terms"} — Package Cost Explorer`;
  app.innerHTML = shell(`<main id="main" class="legal-page">
    <p class="kicker">Policy desk / Effective 27 August 2026</p>
    <h1>${privacy ? "Privacy, in plain ink." : "Terms of use."}</h1>
    ${privacy ? `<p class="lede">Package Cost Explorer performs analysis on your device. We do not operate an analysis API, create user accounts, or collect package lookups.</p>
      <h2>Data the app handles</h2><p>The package query in a shared URL is visible in that URL. The app fetches public metadata and tarballs directly from the npm registry. Those requests are governed by npm’s own network logs and privacy terms.</p>
      <h2>Storage</h2><p>A service worker caches static application files on your device for faster and offline shell loading. Analysis results and package contents are kept in memory and disappear when the page is closed or refreshed. We set no tracking cookies and use no analytics.</p>
      <h2>Your control</h2><p>Clear this site’s storage in your browser to remove the cached shell. Avoid sharing a result URL if you do not want its public package name and version included.</p>`
    : `<p class="lede">This free tool provides reproducible estimates for dependency decisions. Use it as one input, then validate critical choices in your own build.</p>
      <h2>What the measurement means</h2><p>Bundle figures are generated in your browser with esbuild, browser/import export conditions, minification, and compression. Peer dependencies, Node built-ins, native modules, stylesheets, and non-JavaScript assets can be excluded and are called out in the report.</p>
      <h2>No warranty</h2><p>The software is provided “as is,” without warranty. Registry metadata and package contents belong to their respective publishers. You are responsible for evaluating licenses, security, and suitability.</p>
      <h2>Fair use</h2><p>Do not use the site to overload the npm registry or inspect packages you are not authorized to access. The source code is available under the MIT License.</p>`}
    <p><a class="text-link" href="/">← Return to the explorer</a></p>
  </main>`);
}

if (location.pathname === "/privacy" || location.pathname === "/privacy/") renderLegal("privacy");
else if (location.pathname === "/terms" || location.pathname === "/terms/") renderLegal("terms");
else renderExplorer();

function renderExplorer() {
  document.title = "Package Cost Explorer — the full npm package ledger";
  app.innerHTML = shell(`<main id="main">
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy">
        <p class="kicker">The independent package ledger</p>
        <h1 id="page-title">Count what your import really costs.</h1>
        <p class="lede">Install weight, transitive bloat, and a tree-shaken bill for every public export—computed on this page, never queued on a server.</p>
        <form id="search-form" class="search-form" novalidate>
          <label for="package-input">Package and version</label>
          <div class="search-row">
            <input id="package-input" name="package" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="date-fns@latest" aria-describedby="package-help package-error" required />
            <button class="primary-button" type="submit">Run the numbers <span aria-hidden="true">→</span></button>
          </div>
          <p id="package-help" class="field-note">Try <button type="button" class="inline-example" data-example="date-fns@latest">date-fns</button>, <button type="button" class="inline-example" data-example="lodash-es@latest">lodash-es</button>, or a scoped package.</p>
          <p id="package-error" class="field-error" aria-live="polite"></p>
        </form>
        <ul class="proof-points" aria-label="Analysis properties">
          <li><span aria-hidden="true">01</span> Reads the exports map</li>
          <li><span aria-hidden="true">02</span> Bundles inside your browser</li>
          <li><span aria-hidden="true">03</span> Sends us nothing</li>
        </ul>
      </div>
      <figure class="hero-art">
        <picture>
          <source type="image/avif" srcset="/assets/package-ledger-800.avif 800w, /assets/package-ledger.avif 1536w" sizes="(max-width: 760px) 100vw, 46vw" />
          <source type="image/webp" srcset="/assets/package-ledger-800.webp 800w, /assets/package-ledger.webp 1536w" sizes="(max-width: 760px) 100vw, 46vw" />
          <img src="/assets/package-ledger-800.webp" width="800" height="533" alt="An opened paper package feeding several cyan branches into differently sized halftone dependency nodes" fetchpriority="high" decoding="async" />
        </picture>
        <figcaption>One archive. Many public doors. Each carries a different bill.</figcaption>
      </figure>
    </section>

    <aside id="offline-banner" class="offline-banner" hidden><strong>Offline edition.</strong> The interface is cached, but a fresh package needs the npm registry. Reconnect to analyze.</aside>

    <section id="analysis-status" class="analysis-status" hidden aria-labelledby="status-heading" aria-live="polite">
      <div><p class="kicker">Live dispatch</p><h2 id="status-heading">Opening the registry record…</h2><p id="status-detail">This work happens locally and may take a moment on large dependency trees.</p></div>
      <div class="status-actions"><span id="progress-label">0%</span><button id="cancel-button" class="quiet-button" type="button">Cancel</button></div>
      <div class="progress-track" aria-hidden="true"><span id="progress-bar"></span></div>
    </section>

    <section id="results" class="results" hidden aria-labelledby="results-title"></section>

    <section id="method" class="method">
      <p class="kicker">How the edition is made</p>
      <div class="method-grid">
        <h2>The registry is the source. Your browser is the press.</h2>
        <div><p>We resolve the chosen npm version and its public <code>exports</code>, download the published tarball, then run esbuild-wasm with browser/import conditions. Production dependency metadata is walked separately to expose install-tree bloat.</p><p>These are decision-grade estimates, not claims about your exact app. Your bundler, target, aliases, and existing shared dependencies can change the final number.</p></div>
      </div>
    </section>
  </main>`);

  bindExplorer();
}

interface AppState {
  packument?: Packument;
  manifest?: PackageManifest;
  archive?: ArchivePackage;
  entries: PublicEntry[];
  measurements: BundleMeasurement[];
  named: NamedMeasurement[];
  dependencies?: DependencyReport;
  history: VersionPoint[];
  downloaded: number;
  controller?: AbortController;
}

const state: AppState = { entries: [], measurements: [], named: [], history: [], downloaded: 0 };

function bindExplorer() {
  const form = document.querySelector<HTMLFormElement>("#search-form")!;
  const input = document.querySelector<HTMLInputElement>("#package-input")!;
  const cancel = document.querySelector<HTMLButtonElement>("#cancel-button")!;
  const offline = document.querySelector<HTMLElement>("#offline-banner")!;

  const updateOnline = () => { offline.hidden = navigator.onLine; };
  addEventListener("online", updateOnline);
  addEventListener("offline", updateOnline);
  updateOnline();

  document.querySelectorAll<HTMLButtonElement>("[data-example]").forEach((button) => button.addEventListener("click", () => {
    input.value = button.dataset.example || "";
    input.focus();
  }));
  cancel.addEventListener("click", () => state.controller?.abort());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void analyze(input.value);
  });

  const shared = new URLSearchParams(location.search).get("q");
  if (shared) {
    input.value = shared;
    window.setTimeout(() => void analyze(shared), 50);
  }
}

function setStatus(title: string, detail: string, progress: number) {
  const region = document.querySelector<HTMLElement>("#analysis-status")!;
  region.hidden = false;
  document.querySelector("#status-heading")!.textContent = title;
  document.querySelector("#status-detail")!.textContent = detail;
  document.querySelector("#progress-label")!.textContent = `${Math.round(progress)}%`;
  (document.querySelector<HTMLElement>("#progress-bar")!).style.width = `${Math.max(2, progress)}%`;
}

async function analyze(raw: string) {
  const error = document.querySelector<HTMLElement>("#package-error")!;
  const results = document.querySelector<HTMLElement>("#results")!;
  error.textContent = "";
  try {
    const spec = parsePackageSpec(raw);
    if (!navigator.onLine) throw new Error("You are offline. Reconnect before opening a new package record.");
    state.controller?.abort();
    const controller = new AbortController();
    state.controller = controller;
    results.hidden = true;
    setStatus("Opening the registry record…", `Resolving ${spec.name}@${spec.requested} against npm.`, 8);

    const packument = await fetchPackument(spec.name, controller.signal);
    const manifest = resolveManifest(packument, spec.requested);
    const canonical = `${manifest.name}@${manifest.version}`;
    history.replaceState(null, "", `/?q=${encodeURIComponent(canonical)}`);
    const input = document.querySelector<HTMLInputElement>("#package-input")!;
    input.value = canonical;
    setStatus("Reading the package archive…", "Unpacking the published tarball and its complete package manifest.", 22);

    let dependencyProgress = 0;
    const dependenciesPromise = countDependencies(manifest, controller.signal, (count) => {
      dependencyProgress = count;
      setStatus("Following the dependency trail…", `${count} unique production packages resolved from registry metadata.`, Math.min(52, 28 + count / 10));
    });
    const archive = await downloadPackage(manifest, controller.signal);
    const completeManifest = archive.manifest;
    const entries = listPublicEntries(completeManifest);
    const chosen = entries.slice(0, 4);
    setStatus("Running the bundle desk…", `Measuring ${chosen.length} ${chosen.length === 1 ? "entry" : "entries"} with esbuild-wasm.`, 55);
    const bundlePromise = bundleEntries(archive, chosen, controller.signal, (done, total, label) => {
      setStatus("Running the bundle desk…", done === total ? "Compressing the final figures." : `Tree-shaking ${label}. Dependency trail: ${dependencyProgress}.`, 55 + (done / Math.max(1, total)) * 38);
    });
    const [dependencies, bundles] = await Promise.all([dependenciesPromise, bundlePromise]);
    Object.assign(state, { packument, manifest: completeManifest, archive, entries, dependencies, history: versionHistory(packument), measurements: bundles.measurements, named: bundles.named, downloaded: bundles.downloaded });
    setStatus("Edition complete.", `${canonical} was measured entirely in this tab.`, 100);
    renderResults();
    window.setTimeout(() => { document.querySelector<HTMLElement>("#analysis-status")!.hidden = true; }, 450);
  } catch (caught) {
    if ((caught as Error).name === "AbortError") {
      error.textContent = "Analysis cancelled. Your previous result, if any, is unchanged.";
    } else {
      error.textContent = (caught as Error).message || "The analysis could not be completed. Try another version.";
    }
    document.querySelector<HTMLElement>("#analysis-status")!.hidden = true;
    document.querySelector<HTMLInputElement>("#package-input")!.focus();
  }
}

function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function chart(points: VersionPoint[]): string {
  if (points.length < 2) return `<p class="empty-note">Not enough published size metadata for a trend.</p>`;
  const values = points.map((point) => point.unpackedSize);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 620, height = 180, pad = 14;
  const coords = points.map((point, index) => {
    const x = pad + index * ((width - pad * 2) / (points.length - 1));
    const y = height - pad - ((point.unpackedSize - min) / Math.max(1, max - min)) * (height - pad * 2);
    return [x, y];
  });
  const path = coords.map(([x, y], index) => `${index ? "L" : "M"}${x?.toFixed(1)} ${y?.toFixed(1)}`).join(" ");
  return `<svg class="history-chart" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">Unpacked size by published version</title><desc id="chart-desc">From ${escapeHtml(points[0]?.version)} at ${formatBytes(points[0]?.unpackedSize)} to ${escapeHtml(points.at(-1)?.version)} at ${formatBytes(points.at(-1)?.unpackedSize)}.</desc><path class="chart-grid" d="M14 14H606M14 90H606M14 166H606"/><path class="chart-line" d="${path}"/>${coords.map(([x,y], i) => `<circle cx="${x}" cy="${y}" r="4"><title>${escapeHtml(points[i]?.version)}: ${formatBytes(points[i]?.unpackedSize)}</title></circle>`).join("")}</svg>`;
}

function renderResults() {
  const results = document.querySelector<HTMLElement>("#results")!;
  const { manifest, entries, measurements, dependencies, named } = state;
  if (!manifest || !dependencies) return;
  const externals = [...new Set(measurements.flatMap((measurement) => measurement.externals))];
  const warnings = [...new Set(measurements.flatMap((measurement) => measurement.warnings))];
  const likelyNode = externals.some((name) => !name.includes("peer"));
  results.innerHTML = `<div class="result-head">
      <div><p class="kicker">Filed package report</p><h2 id="results-title">${escapeHtml(manifest.name)} <span>${escapeHtml(manifest.version)}</span></h2><p>${escapeHtml(manifest.description || "No package description was published.")}</p></div>
      <div class="report-stamp"><span>Measured locally</span><strong>${new Date().toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</strong></div>
    </div>
    <div class="fact-strip">
      <div><span>Published install</span><strong>${formatBytes(manifest.dist?.unpackedSize)}</strong><small>${manifest.dist?.fileCount ? `${manifest.dist.fileCount.toLocaleString()} files` : "unpacked metadata"}</small></div>
      <div><span>Production tree</span><strong>${dependencies.unique.toLocaleString()} deps</strong><small>${dependencies.capped ? "400+ (count capped)" : `${dependencies.direct.length} direct`}</small></div>
      <div><span>Public entries</span><strong>${entries.length.toLocaleString()}</strong><small>${manifest.exports ? "exports map" : "legacy resolution"}</small></div>
      <div><span>Analysis download</span><strong>${formatBytes(state.downloaded)}</strong><small>tarballs fetched this run</small></div>
    </div>
    ${likelyNode ? `<div class="notice warning"><strong>△ Node runtime imports detected.</strong> ${externals.map(escapeHtml).join(", ")} stayed external, so this is not a complete standalone browser bundle.</div>` : `<div class="notice success"><strong>✓ Browser bundle completed.</strong> ${externals.length ? `External peer contracts: ${externals.map(escapeHtml).join(", ")}.` : "No Node built-ins or peer contracts were found in the measured paths."}</div>`}
    <section class="report-section" aria-labelledby="entry-heading">
      <div class="section-heading"><div><p class="kicker">Exports desk</p><h3 id="entry-heading">Cost by public door</h3></div><p>First four entries are measured automatically. Choose up to eight to rerun.</p></div>
      <div class="table-wrap"><table class="measure-table"><thead><tr><th scope="col">Entry</th><th scope="col">Condition → target</th><th scope="col">Minified</th><th scope="col">Gzip</th><th scope="col">Brotli</th></tr></thead><tbody>${measurements.map((measurement) => `<tr><th scope="row"><code>${escapeHtml(measurement.entry.subpath)}</code></th><td><span class="condition">${escapeHtml(measurement.entry.condition)}</span> ${escapeHtml(measurement.entry.target)}</td><td data-label="Minified">${formatBytes(measurement.minified)}</td><td data-label="Gzip"><strong>${formatBytes(measurement.gzip)}</strong></td><td data-label="Brotli">${formatBytes(measurement.brotli)}</td></tr>`).join("")}</tbody></table></div>
      <details class="entry-picker"><summary>Choose different exports</summary><fieldset><legend>Select up to eight public entries</legend><div class="check-grid">${entries.map((entry, index) => `<label><input type="checkbox" name="entry" value="${index}" ${measurements.some((item) => item.entry.subpath === entry.subpath) ? "checked" : ""}/><span><code>${escapeHtml(entry.subpath)}</code><small>${escapeHtml(entry.condition)} → ${escapeHtml(entry.target)}</small></span></label>`).join("")}</div><button id="measure-selection" class="secondary-button" type="button">Measure selection</button><p id="selection-error" class="field-error" aria-live="polite"></p></fieldset></details>
    </section>
    <section class="report-section two-column" aria-labelledby="named-heading">
      <div><p class="kicker">Tree-shaking desk</p><h3 id="named-heading">Named exports, isolated</h3><p>Up to ten statically discoverable names from <code>${escapeHtml(measurements[0]?.entry.subpath || ".")}</code>, each rebuilt alone.</p></div>
      <div>${named.length ? `<ol class="named-list">${named.map((item) => `<li><code>${escapeHtml(item.name)}</code><span>${formatBytes(item.gzip)} gzip</span><small>${formatBytes(item.minified)} min</small></li>`).join("")}</ol>` : `<p class="empty-note">No statically named ESM exports were reported. This often means a CommonJS or default-only entry.</p>`}</div>
    </section>
    <section class="report-section two-column" aria-labelledby="dependency-heading">
      <div><p class="kicker">Dependency desk</p><h3 id="dependency-heading">What arrives with it</h3><p>The production graph is resolved from each published manifest. Dev and optional dependencies are excluded.</p></div>
      <div>${dependencies.direct.length ? `<ul class="dependency-list">${dependencies.direct.slice(0, 12).map((item) => `<li><span>${escapeHtml(item.name)}</span><code>${escapeHtml(item.version || item.range)}</code></li>`).join("")}</ul>${dependencies.direct.length > 12 ? `<p class="field-note">+ ${dependencies.direct.length - 12} more direct dependencies</p>` : ""}` : `<p class="empty-note">Zero declared production dependencies. A clean ledger.</p>`}</div>
    </section>
    <section class="report-section" aria-labelledby="history-heading"><div class="section-heading"><div><p class="kicker">Archive desk</p><h3 id="history-heading">Published weight by version</h3></div><p>Unpacked bytes reported by npm for the latest ${state.history.length} published versions.</p></div>${chart(state.history)}<details class="data-table"><summary>Read chart data</summary><table><thead><tr><th>Version</th><th>Date</th><th>Unpacked</th></tr></thead><tbody>${state.history.map((point) => `<tr><th scope="row">${escapeHtml(point.version)}</th><td>${escapeHtml(point.date.slice(0,10) || "Not in compact metadata")}</td><td>${formatBytes(point.unpackedSize)}</td></tr>`).join("")}</tbody></table></details></section>
    <section class="share-desk" aria-labelledby="share-heading"><div><p class="kicker">Pass it on</p><h3 id="share-heading">Share the exact edition.</h3><p>The link reruns this public package and version in the recipient’s browser. The badge is a self-contained SVG snapshot—no tracking request.</p></div><div class="share-actions"><button id="copy-link" class="secondary-button" type="button">Copy result link</button><button id="download-badge" class="quiet-button" type="button">Download SVG badge</button><span id="copy-status" role="status"></span></div></section>
    <aside class="method-note"><strong>Scope of this estimate.</strong> JavaScript only; CSS, static assets, optional/native modules, and external peers are excluded. esbuild target: ES2020 browser, ESM, minified. ${warnings.length ? escapeHtml(warnings.join(" ")) : "No additional build warnings."}</aside>`;
  results.hidden = false;
  bindResultActions();
  results.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

function badgeSvg(): string {
  const pkg = state.manifest!;
  const gzip = state.measurements[0]?.gzip;
  const left = `${pkg.name}@${pkg.version}`;
  const right = `${formatBytes(gzip)} gzip`;
  const leftWidth = Math.max(104, left.length * 7 + 18), rightWidth = Math.max(82, right.length * 7 + 18);
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(left)}: ${escapeHtml(right)}" width="${leftWidth + rightWidth}" height="28"><rect width="${leftWidth}" height="28" fill="#121513"/><rect x="${leftWidth}" width="${rightWidth}" height="28" fill="#006f7a"/><g fill="#fff" font-family="Arial,sans-serif" font-size="12"><text x="9" y="18">${escapeHtml(left)}</text><text x="${leftWidth + 9}" y="18">${escapeHtml(right)}</text></g></svg>`;
}

function bindResultActions() {
  document.querySelector("#measure-selection")?.addEventListener("click", async () => {
    const error = document.querySelector<HTMLElement>("#selection-error")!;
    const selected = [...document.querySelectorAll<HTMLInputElement>('input[name="entry"]:checked')].map((input) => state.entries[Number(input.value)]).filter(Boolean) as PublicEntry[];
    if (!selected.length || selected.length > 8) { error.textContent = "Select between one and eight entries."; return; }
    error.textContent = "";
    const controller = new AbortController(); state.controller = controller;
    try {
      setStatus("Running the bundle desk…", `Measuring ${selected.length} selected entries.`, 55);
      const bundles = await bundleEntries(state.archive!, selected, controller.signal, (done, total, label) => setStatus("Running the bundle desk…", done === total ? "Compressing the final figures." : `Tree-shaking ${label}.`, 55 + (done / Math.max(1, total)) * 40));
      state.measurements = bundles.measurements; state.named = bundles.named; state.downloaded = bundles.downloaded;
      document.querySelector<HTMLElement>("#analysis-status")!.hidden = true;
      renderResults();
    } catch (caught) {
      document.querySelector<HTMLElement>("#analysis-status")!.hidden = true;
      error.textContent = (caught as Error).name === "AbortError" ? "Measurement cancelled." : (caught as Error).message;
    }
  });
  document.querySelector("#copy-link")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(location.href);
    document.querySelector("#copy-status")!.textContent = "Link copied.";
  });
  document.querySelector("#download-badge")?.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([badgeSvg()], { type: "image/svg+xml" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${state.manifest!.name.replace("/", "-")}-size.svg`; anchor.click();
    URL.revokeObjectURL(url); document.querySelector("#copy-status")!.textContent = "Badge downloaded.";
  });
}

if ("serviceWorker" in navigator && import.meta.env.PROD) addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));
