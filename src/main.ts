import "./style.css";
import { downloadPackage } from "./archive";
import { badgeDataUrl, badgeLabel, badgeUrl } from "./badge";
import { bundleEntries } from "./bundler";
import { listPublicEntries } from "./exports-map";
import { parsePackageSpec, resolveManifest } from "./package-spec";
import { confirmPublicPackage, countDependencies, fetchPackument, versionHistory } from "./registry";
import type { ArchivePackage, BundleMeasurement, DependencyReport, NamedMeasurement, PackageManifest, Packument, PublicEntry, VersionPoint } from "./types";

const app = document.querySelector<HTMLDivElement>("#app")!;
const PRODUCT_ORIGIN = "https://package-cost-explorer.sociobot.in";

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
  demo: boolean;
}

const state: AppState = { entries: [], measurements: [], named: [], history: [], downloaded: 0, demo: false };

const demoState = {
  manifest: {
    name: "date-fns",
    version: "4.1.0",
    description: "Modern JavaScript date utility library",
    exports: { ".": "./index.js", "./addDays": "./addDays.js", "./format": "./format.js" },
    dist: { tarball: "", unpackedSize: 22_780_416 },
  } satisfies PackageManifest,
  entries: [
    { subpath: ".", label: "date-fns", target: "./index.js", condition: "import" },
    { subpath: "./addDays", label: "date-fns/addDays", target: "./addDays.js", condition: "import" },
    { subpath: "./format", label: "date-fns/format", target: "./format.js", condition: "import" },
  ] satisfies PublicEntry[],
  measurements: [
    { entry: { subpath: ".", label: "date-fns", target: "./index.js", condition: "import" }, minified: 107_426, gzip: 23_814, brotli: 19_982, exports: ["addDays", "format"], warnings: [], externals: [] },
    { entry: { subpath: "./addDays", label: "date-fns/addDays", target: "./addDays.js", condition: "import" }, minified: 1_178, gzip: 608, brotli: 521, exports: ["addDays"], warnings: [], externals: [] },
    { entry: { subpath: "./format", label: "date-fns/format", target: "./format.js", condition: "import" }, minified: 19_624, gzip: 5_083, brotli: 4_391, exports: ["format"], warnings: [], externals: [] },
  ] satisfies BundleMeasurement[],
  named: [{ name: "addDays", minified: 1_178, gzip: 608 }, { name: "format", minified: 19_624, gzip: 5_083 }] satisfies NamedMeasurement[],
  dependencies: { unique: 0, traversed: 0, unpackedBytes: 22_780_416, capped: false, direct: [] } satisfies DependencyReport,
  history: [
    { version: "3.6.0", date: "2024-09-17", unpackedSize: 22_314_246 },
    { version: "4.0.0", date: "2024-09-17", unpackedSize: 22_540_803 },
    { version: "4.1.0", date: "2024-09-17", unpackedSize: 22_780_416 },
  ] satisfies VersionPoint[],
};

type RouteName = "home" | "demo" | "privacy" | "terms" | "not-found";
const routeMeta: Record<RouteName, { title: string; description: string; path: string }> = {
  home: { title: "Package Cost Explorer — Compare npm package costs", description: "Compare npm install size and bundle size for each package entry point before adding a dependency.", path: "/" },
  demo: { title: "Demo — Package Cost Explorer", description: "Open a completed sample npm package report without contacting npm or saving data.", path: "/demo" },
  privacy: { title: "Privacy — Package Cost Explorer", description: "Learn what Package Cost Explorer requests, stores, and sends when it measures an npm package.", path: "/privacy" },
  terms: { title: "Terms — Package Cost Explorer", description: "Read the measurement limits and terms for Package Cost Explorer.", path: "/terms" },
  "not-found": { title: "Page not found — Package Cost Explorer", description: "This Package Cost Explorer page does not exist. Return home or open the sample report.", path: location.pathname },
};

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);
}

function setMeta(route: RouteName) {
  const meta = routeMeta[route];
  document.title = meta.title;
  const setContent = (selector: string, value: string) => document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", value);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", `${PRODUCT_ORIGIN}${meta.path}`);
  setContent('meta[name="description"]', meta.description);
  setContent('meta[property="og:title"]', meta.title);
  setContent('meta[property="og:description"]', meta.description);
  setContent('meta[property="og:url"]', `${PRODUCT_ORIGIN}${meta.path}`);
  setContent('meta[name="twitter:title"]', meta.title);
  setContent('meta[name="twitter:description"]', meta.description);
}

function currentRoute(): RouteName {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  if ((path === "/" && new URLSearchParams(location.search).get("demo") === "1") || path === "/demo") return "demo";
  if (path === "/") return "home";
  if (path === "/privacy") return "privacy";
  if (path === "/terms") return "terms";
  return "not-found";
}

function shell(content: string, demo = false): string {
  const build = document.querySelector<HTMLMetaElement>('meta[name="app-build"]')?.content || "local";
  return `<div class="paper${demo ? " demo-mode" : ""}">
    <header class="masthead">
      <a class="wordmark" href="/" data-route aria-label="Package Cost Explorer home"><span aria-hidden="true">▰</span> Package Cost Explorer</a>
      <nav class="site-nav" aria-label="Main navigation"><a href="/" data-route>Home</a><a href="/demo" data-route>Demo</a><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a></nav>
    </header>
    ${demo ? `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span id="demo-status" class="demo-status" aria-live="polite"></span><div><button id="reset-demo" class="quiet-button" type="button">Reset demo</button><a class="quiet-button" href="/" data-route>Start for real</a></div></aside>` : ""}
    ${content}
    <footer class="footer">
      <p>Compare npm install and import sizes before adding a dependency.</p>
      <nav aria-label="Footer navigation"><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><a href="https://github.com/B-Divyesh/sf-package-cost-explorer" target="_blank" rel="noreferrer">Source repository <span class="sr-only">(opens in a new tab)</span>↗</a></nav>
      <p>Built by Param Factory <span aria-hidden="true">·</span> Build ${escapeHtml(build)}</p>
      <p class="generated-note">Hero artwork was generated for this project with Azure OpenAI.</p>
    </footer><div id="route-status" class="sr-only" aria-live="polite"></div>
  </div>`;
}

function sharedExplorerSections(): string {
  return `<aside id="offline-banner" class="offline-banner" role="status" hidden><strong>You are offline.</strong> This page still works, but npm must be reachable to measure a new package.</aside>
    <aside id="update-toast" class="update-toast" hidden role="status"><span>An update is ready.</span><button id="reload-update" class="quiet-button" type="button">Reload page</button></aside>
    <section id="analysis-status" class="analysis-status" hidden aria-labelledby="status-heading" aria-live="polite"><div><p class="kicker">Package measurement progress</p><h2 id="status-heading">Looking up the package on npm…</h2><p id="status-detail">Your browser is measuring this package. Large dependency lists can take longer.</p></div><div class="status-actions"><span id="progress-label">0%</span><button id="cancel-button" class="quiet-button" type="button">Cancel measurement</button></div><div class="progress-track" aria-hidden="true"><span id="progress-bar"></span></div></section>
    <section id="results" class="results" hidden aria-labelledby="results-title"></section>
    <section class="method" aria-labelledby="method-title"><p class="kicker">How package measurement works</p><h2 id="method-title">From npm package to size report.</h2><ol class="method-steps"><li><strong>Choose a package.</strong><span>Enter a package name and version.</span></li><li><strong>Measure its files.</strong><span>Your browser downloads public package files from npm.</span></li><li><strong>Compare entry points.</strong><span>Review installed size and compressed JavaScript size.</span></li></ol><div class="scope-copy"><h3>What the estimate does not decide</h3><p>Your app settings and shared code can change the final size. Confirm important numbers in your own build.</p></div></section>`;
}

function renderHome() {
  state.demo = false;
  app.innerHTML = shell(`<main id="main"><section class="hero" aria-labelledby="page-title"><div class="hero-copy">
    <p class="kicker">npm package size checker</p><h1 id="page-title" tabindex="-1">Compare npm package costs before you install.</h1>
    <p class="lede">For frontend and Node developers choosing a dependency, see install size and each import’s bundle size.</p>
    <div class="demo-cta"><a class="primary-button" href="/demo" data-route>Try it with sample data <span aria-hidden="true">→</span></a><span>Open a completed package report.</span></div>
    <form id="search-form" class="search-form" novalidate><label for="package-input">Package and version</label><div class="search-row"><input id="package-input" name="package" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="date-fns@latest" aria-describedby="package-help package-error" required /><button class="secondary-button" type="submit">Measure this package</button></div><p id="package-help" class="field-note">See its install and import sizes. Try <button type="button" class="inline-example" data-example="date-fns@latest">date-fns</button> or <button type="button" class="inline-example" data-example="lodash-es@latest">lodash-es</button>.</p><p id="package-error" class="field-error" aria-live="polite"></p></form>
    <ul class="proof-points" aria-label="Product facts"><li><span aria-hidden="true">01</span> Free to use. No account.</li><li><span aria-hidden="true">02</span> Reloads offline after the first visit.</li><li><span aria-hidden="true">03</span> Real measurements contact npm directly.</li></ul>
    </div><figure class="hero-art"><picture><source type="image/avif" srcset="/assets/package-ledger-800.avif 800w, /assets/package-ledger.avif 1536w" sizes="(max-width: 760px) 100vw, 46vw" /><source type="image/webp" srcset="/assets/package-ledger-800.webp 800w, /assets/package-ledger.webp 1536w" sizes="(max-width: 760px) 100vw, 46vw" /><img src="/assets/package-ledger-800.webp" width="800" height="533" alt="An opened paper package branches into differently sized dependency paths" fetchpriority="high" decoding="async" /></picture><figcaption>One package can expose several entry points. Each can add a different bundle size.</figcaption></figure></section>${sharedExplorerSections()}</main>`);
  bindExplorer();
}

function seedDemo() {
  state.controller?.abort();
  Object.assign(state, demoState, { demo: true, downloaded: 1_042_318, archive: undefined, packument: undefined });
}

function renderDemo() {
  seedDemo();
  app.innerHTML = shell(`<main id="main"><section class="demo-intro" aria-labelledby="page-title"><div><p class="kicker">Completed sample / date-fns 4.1.0</p><h1 id="page-title" tabindex="-1">See a completed npm package report.</h1></div><p>This fixed sample shows installed size, package entry points, and bundle sizes. It makes no npm request.</p></section><section id="results" class="results" aria-labelledby="results-title"></section><aside id="offline-banner" class="offline-banner" role="status" hidden><strong>You are offline.</strong> The sample report remains available.</aside><aside id="update-toast" class="update-toast" hidden role="status"><span>An update is ready.</span><button id="reload-update" class="quiet-button" type="button">Reload page</button></aside></main>`, true);
  bindOnlineState();
  bindDemoControls();
  renderResults(false);
}

function renderLegal(kind: "privacy" | "terms") {
  const privacy = kind === "privacy";
  app.innerHTML = shell(`<main id="main" class="legal-page"><p class="kicker">Policy desk / Effective 28 August 2026</p><h1 tabindex="-1">${privacy ? "Privacy in plain words." : "Terms of use."}</h1>
    ${privacy ? `<p class="lede">Package Cost Explorer uses no account, analytics, tracking cookies, or saved reports.</p><h2>Real package measurements</h2><p>When you measure a real package, your browser requests public package details and files directly from npm. npm may record those requests under its own privacy terms.</p><h2>Sample report</h2><p>The demo uses fixed sample data. It does not contact npm or read or write browser storage.</p><h2>Offline page</h2><p>After one visit, a service worker caches the interface so it can reload offline. A new real measurement still needs npm.</p><h2>Your control</h2><p>Clear this site’s storage to remove the cached interface. Shared result URLs include a public package name and version.</p>` : `<p class="lede">Package Cost Explorer provides estimates for dependency choices. Confirm important figures in your own application build.</p><h2>What the estimate covers</h2><p>The report measures published JavaScript for a browser target. Build settings, shared code, package changes, and network failures can change a result.</p><h2>What you must check</h2><p>Review package licenses, security, and suitability yourself. Do not use this site to overload npm or inspect private packages.</p><h2>No warranty</h2><p>The software is provided “as is,” without warranty. The repository license governs reuse of the source code.</p>`}
    <p><a class="text-link" href="/" data-route>← Return to package measurement</a></p></main>`);
}

function renderNotFound() {
  app.innerHTML = shell(`<main id="main" class="not-found"><p class="error-code" aria-hidden="true">404</p><p class="kicker">Misfiled package page</p><h1 tabindex="-1">This package page does not exist.</h1><p>The address may be incomplete or out of date.</p><div class="not-found-actions"><a class="primary-button" href="/" data-route>Return home</a><a class="text-link" href="/demo" data-route>Open the sample report</a></div></main>`);
}

function renderRoute(focusHeading = false) {
  const route = currentRoute();
  state.controller?.abort();
  setMeta(route);
  if (route === "home") renderHome();
  else if (route === "demo") renderDemo();
  else if (route === "privacy" || route === "terms") renderLegal(route);
  else renderNotFound();
  document.querySelector("#reload-update")?.addEventListener("click", () => location.reload());
  if (focusHeading) {
    window.scrollTo(0, 0);
    const heading = document.querySelector<HTMLHeadingElement>("h1");
    heading?.focus({ preventScroll: true });
    const status = document.querySelector<HTMLElement>("#route-status");
    if (status && heading) status.textContent = `${heading.textContent} page loaded.`;
  }
}

function navigate(href: string) { history.pushState(null, "", href); renderRoute(true); }

function bindOnlineState() {
  const update = () => {
    const offline = document.querySelector<HTMLElement>("#offline-banner");
    if (offline) offline.hidden = navigator.onLine;
    const submit = document.querySelector<HTMLButtonElement>('#search-form button[type="submit"]');
    if (submit) submit.disabled = !navigator.onLine;
  };
  window.ononline = update; window.onoffline = update; update();
}

function clearDemoStorage() {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) { const key = localStorage.key(index); if (key?.startsWith("demo:")) localStorage.removeItem(key); }
  for (let index = sessionStorage.length - 1; index >= 0; index -= 1) { const key = sessionStorage.key(index); if (key?.startsWith("demo:")) sessionStorage.removeItem(key); }
}

function bindDemoControls() {
  document.querySelector("#reset-demo")?.addEventListener("click", () => {
    clearDemoStorage(); seedDemo(); renderResults(false);
    const status = document.querySelector<HTMLElement>("#demo-status"); if (status) status.textContent = "Sample reset.";
    document.querySelector<HTMLButtonElement>("#reset-demo")?.focus();
  });
}

function bindExplorer() {
  const form = document.querySelector<HTMLFormElement>("#search-form")!;
  const input = document.querySelector<HTMLInputElement>("#package-input")!;
  bindOnlineState();
  document.querySelector("#cancel-button")?.addEventListener("click", () => state.controller?.abort());
  document.querySelectorAll<HTMLButtonElement>("[data-example]").forEach((button) => button.addEventListener("click", () => { input.value = button.dataset.example || ""; input.focus(); }));
  form.addEventListener("submit", (event) => { event.preventDefault(); void analyze(input.value); });
  const shared = new URLSearchParams(location.search).get("q");
  if (shared) { input.value = shared; window.setTimeout(() => void analyze(shared), 50); }
}

function setStatus(title: string, detail: string, progress: number) {
  const region = document.querySelector<HTMLElement>("#analysis-status")!; region.hidden = false;
  document.querySelector("#status-heading")!.textContent = title; document.querySelector("#status-detail")!.textContent = detail;
  document.querySelector("#progress-label")!.textContent = `${Math.round(progress)}%`; document.querySelector<HTMLElement>("#progress-bar")!.style.width = `${Math.max(2, progress)}%`;
}

async function analyze(raw: string) {
  const error = document.querySelector<HTMLElement>("#package-error")!;
  const results = document.querySelector<HTMLElement>("#results")!;
  error.textContent = "";
  try {
    const spec = parsePackageSpec(raw);
    if (!navigator.onLine) throw new Error("You are offline. Reconnect before measuring a new package.");
    state.controller?.abort(); const controller = new AbortController(); state.controller = controller; results.hidden = true;
    setStatus("Checking npm for this package…", `Confirming ${spec.name} before downloading its public files.`, 5);
    await confirmPublicPackage(spec.name, controller.signal);
    setStatus("Reading package details…", `Resolving ${spec.name}@${spec.requested} on npm.`, 8);
    const packument = await fetchPackument(spec.name, controller.signal); const manifest = resolveManifest(packument, spec.requested); const canonical = `${manifest.name}@${manifest.version}`;
    history.replaceState(null, "", `/?q=${encodeURIComponent(canonical)}`); document.querySelector<HTMLInputElement>("#package-input")!.value = canonical;
    setStatus("Reading package files…", "Opening the published package and its package.json file.", 22);
    let dependencyProgress = 0;
    const dependenciesPromise = countDependencies(manifest, controller.signal, (count) => { dependencyProgress = count; setStatus("Counting production dependencies…", `${count} package versions counted.`, Math.min(52, 28 + count / 10)); });
    const archive = await downloadPackage(manifest, controller.signal); const completeManifest = archive.manifest; const entries = listPublicEntries(completeManifest, archive.files.keys());
    setStatus("Measuring package entry points…", `Measuring ${entries.length.toLocaleString()} ${entries.length === 1 ? "entry point" : "entry points"}.`, 55);
    const bundlePromise = bundleEntries(archive, entries, controller.signal, (done, total, label) => setStatus("Measuring package entry points…", done === total ? "Compressing the final figures." : `Measuring ${label} (${done + 1}/${total}). Dependencies counted: ${dependencyProgress}.`, 55 + (done / Math.max(1, total)) * 38));
    const [dependencies, bundles] = await Promise.all([dependenciesPromise, bundlePromise]);
    Object.assign(state, { packument, manifest: completeManifest, archive, entries, dependencies, history: versionHistory(packument), measurements: bundles.measurements, named: bundles.named, downloaded: bundles.downloaded, demo: false });
    setStatus("Package report complete.", `${canonical} was measured in this browser tab.`, 100); renderResults();
    window.setTimeout(() => { document.querySelector<HTMLElement>("#analysis-status")!.hidden = true; }, 450);
  } catch (caught) {
    error.textContent = (caught as Error).name === "AbortError" ? "Measurement cancelled. Your previous report is unchanged." : (caught as Error).message || "The package could not be measured. Try another version.";
    document.querySelector<HTMLElement>("#analysis-status")!.hidden = true; document.querySelector<HTMLInputElement>("#package-input")!.focus();
  }
}

function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) return "—"; if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} kB`; return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function chart(points: VersionPoint[]): string {
  if (points.length < 2) return `<p class="empty-note">This package has too little size history for a chart.</p>`;
  const values = points.map((point) => point.unpackedSize); const min = Math.min(...values), max = Math.max(...values), width = 620, height = 180, pad = 14;
  const coords = points.map((point, index) => [pad + index * ((width - pad * 2) / (points.length - 1)), height - pad - ((point.unpackedSize - min) / Math.max(1, max - min)) * (height - pad * 2)]);
  const path = coords.map(([x, y], index) => `${index ? "L" : "M"}${x?.toFixed(1)} ${y?.toFixed(1)}`).join(" ");
  return `<svg class="history-chart" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">Installed size by published version</title><desc id="chart-desc">From ${escapeHtml(points[0]?.version)} at ${formatBytes(points[0]?.unpackedSize)} to ${escapeHtml(points.at(-1)?.version)} at ${formatBytes(points.at(-1)?.unpackedSize)}.</desc><path class="chart-grid" d="M14 14H606M14 90H606M14 166H606"/><path class="chart-line" d="${path}"/>${coords.map(([x,y], index) => `<circle cx="${x}" cy="${y}" r="4"><title>${escapeHtml(points[index]?.version)}: ${formatBytes(points[index]?.unpackedSize)}</title></circle>`).join("")}</svg>`;
}

function renderResults(scroll = true) {
  const results = document.querySelector<HTMLElement>("#results")!; const { manifest, entries, measurements, dependencies, named } = state; if (!manifest || !dependencies) return;
  const externals = [...new Set(measurements.flatMap((measurement) => measurement.externals))]; const warnings = [...new Set(measurements.flatMap((measurement) => measurement.warnings))]; const likelyNode = externals.some((name) => !name.includes("peer"));
  results.innerHTML = `<div class="result-head"><div><p class="kicker">${state.demo ? "Sample package report" : "Completed package report"}</p><h2 id="results-title">${escapeHtml(manifest.name)} <span>${escapeHtml(manifest.version)}</span></h2><p>${escapeHtml(manifest.description || "The publisher provided no package description.")}</p></div><div class="report-stamp"><span>${state.demo ? "Fixed sample" : "Measured here"}</span><strong>${state.demo ? "Demo data" : new Date().toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</strong></div></div>
    ${state.demo ? `<p class="sample-note"><strong>Sample figures.</strong> These fixed values demonstrate the report and are not a current measurement.</p>` : ""}
    <div class="fact-strip"><div><span>${dependencies.capped ? "Installed size (minimum)" : "Installed size"}</span><strong>${formatBytes(dependencies.unpackedBytes)}</strong><small>${dependencies.capped ? "Package count limit reached" : `${formatBytes(manifest.dist?.unpackedSize)} package alone`}</small></div><div><span>Production dependencies</span><strong>${dependencies.unique.toLocaleString()}</strong><small>${dependencies.capped ? "More packages remain" : `${dependencies.direct.length} direct`}</small></div><div><span>Package entry points</span><strong>${entries.length.toLocaleString()}</strong><small>${manifest.exports ? "Published export paths" : "Legacy package entry"}</small></div><div><span>Package downloads</span><strong>${formatBytes(state.downloaded)}</strong><small>${state.demo ? "sample value" : "downloaded for this report"}</small></div></div>
    ${likelyNode ? `<div class="notice warning"><strong>△ Node imports found.</strong> ${externals.map(escapeHtml).join(", ")} are outside this browser bundle.</div>` : `<div class="notice success"><strong>✓ Browser bundle completed.</strong> ${externals.length ? `External package contracts: ${externals.map(escapeHtml).join(", ")}.` : "No Node built-ins or external package contracts were found in these paths."}</div>`}
    <section class="report-section" aria-labelledby="entry-heading"><div class="section-heading"><div><p class="kicker">Entry point sizes</p><h3 id="entry-heading">Compare each public import</h3></div><p>Each published entry point can include a different amount of JavaScript.</p></div><div class="table-wrap"><table class="measure-table"><thead><tr><th scope="col">Entry point</th><th scope="col">Published file</th><th scope="col">Minified</th><th scope="col">Gzip</th><th scope="col">Brotli</th></tr></thead><tbody>${measurements.map((measurement) => `<tr><th scope="row"><code>${escapeHtml(measurement.entry.subpath)}</code></th><td><span class="condition">${escapeHtml(measurement.entry.condition)}</span> ${escapeHtml(measurement.entry.target)}</td><td data-label="Minified">${formatBytes(measurement.minified)}</td><td data-label="Gzip"><strong>${formatBytes(measurement.gzip)}</strong></td><td data-label="Brotli">${formatBytes(measurement.brotli)}</td></tr>`).join("")}</tbody></table></div>${state.demo ? "" : `<details class="entry-picker"><summary>Choose entry points to measure again (${entries.length.toLocaleString()} available)</summary><fieldset><legend>Select one or more entry points</legend><div class="check-grid">${entries.map((entry, index) => `<label><input type="checkbox" name="entry" value="${index}" ${measurements.some((item) => item.entry.subpath === entry.subpath) ? "checked" : ""}/><span><code>${escapeHtml(entry.subpath)}</code><small>${escapeHtml(entry.condition)} → ${escapeHtml(entry.target)}</small></span></label>`).join("")}</div><button id="measure-selection" class="secondary-button" type="button">Measure selected entries</button><p id="selection-error" class="field-error" aria-live="polite"></p></fieldset></details>`}</section>
    <section class="report-section two-column" aria-labelledby="named-heading"><div><p class="kicker">Individual exports</p><h3 id="named-heading">Smallest named imports</h3><p>Each listed name is measured by itself from <code>${escapeHtml(measurements[0]?.entry.subpath || ".")}</code>.</p></div><div>${named.length ? `<ol class="named-list">${named.map((item) => `<li><code>${escapeHtml(item.name)}</code><span>${formatBytes(item.gzip)} gzip</span><small>${formatBytes(item.minified)} min</small></li>`).join("")}</ol>` : `<p class="empty-note">No named JavaScript exports were found for this entry point.</p>`}</div></section>
    <section class="report-section two-column" aria-labelledby="dependency-heading"><div><p class="kicker">Installed packages</p><h3 id="dependency-heading">What arrives with it</h3><p>Production dependencies add to the installed size.</p></div><div>${dependencies.direct.length ? `<ul class="dependency-list">${dependencies.direct.slice(0, 12).map((item) => `<li><span>${escapeHtml(item.name)}</span><code>${escapeHtml(item.version || item.range)}</code></li>`).join("")}</ul>` : `<p class="empty-note">This package declares no production dependencies.</p>`}</div></section>
    <section class="report-section" aria-labelledby="history-heading"><div class="section-heading"><div><p class="kicker">Published versions</p><h3 id="history-heading">Installed size over time</h3></div><p>Recent installed-size figures reported in npm package details.</p></div>${chart(state.history)}<details class="data-table"><summary>Read chart data</summary><table><thead><tr><th>Version</th><th>Date</th><th>Installed size</th></tr></thead><tbody>${state.history.map((point) => `<tr><th scope="row">${escapeHtml(point.version)}</th><td>${escapeHtml(point.date.slice(0,10) || "Date unavailable")}</td><td>${formatBytes(point.unpackedSize)}</td></tr>`).join("")}</tbody></table></details></section>
    <section class="share-desk" aria-labelledby="share-heading"><div><p class="kicker">Share this report</p><h3 id="share-heading">Copy the exact package report.</h3><p>${state.demo ? "The sample link opens this isolated report. The badge contains the sample package, version, and gzip size." : "The link measures this public package version again. The badge contains its package, version, and gzip size."}</p></div><div class="share-actions"><button id="copy-link" class="secondary-button" type="button">Copy report link</button><button id="copy-badge" class="quiet-button" type="button">Copy SVG badge</button><a id="badge-link" class="quiet-button badge-link" href="${escapeHtml(badgeUrl(location.origin, badgeValues()))}" target="_blank" rel="noreferrer">Open SVG badge <span class="sr-only">(opens in a new tab)</span>↗</a><span id="copy-status" role="status"></span></div></section>
    <aside class="method-note"><strong>Estimate scope.</strong> The JavaScript figure excludes stylesheets, static assets, optional native modules, and external package contracts. ${warnings.length ? escapeHtml(warnings.join(" ")) : "No additional build warnings."}</aside>`;
  results.hidden = false; bindResultActions(); if (scroll) results.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

function badgeValues() { const pkg = state.manifest!; return { packageName: pkg.name, version: pkg.version, gzip: state.measurements[0]?.gzip }; }

function bindResultActions() {
  document.querySelector("#measure-selection")?.addEventListener("click", async () => {
    const error = document.querySelector<HTMLElement>("#selection-error")!; const selected = [...document.querySelectorAll<HTMLInputElement>('input[name="entry"]:checked')].map((input) => state.entries[Number(input.value)]).filter(Boolean) as PublicEntry[];
    if (!selected.length) { error.textContent = "Select at least one package entry point."; return; }
    const controller = new AbortController(); state.controller = controller; error.textContent = "";
    try {
      setStatus("Measuring package entry points…", `Measuring ${selected.length} selected entries.`, 55);
      const bundles = await bundleEntries(state.archive!, selected, controller.signal, (done, total, label) => setStatus("Measuring package entry points…", done === total ? "Compressing the final figures." : `Measuring ${label}.`, 55 + (done / Math.max(1, total)) * 40));
      const refreshed = new Map(state.measurements.map((measurement) => [measurement.entry.subpath, measurement])); bundles.measurements.forEach((measurement) => refreshed.set(measurement.entry.subpath, measurement));
      state.measurements = state.entries.map((entry) => refreshed.get(entry.subpath)).filter(Boolean) as BundleMeasurement[]; state.named = bundles.named; state.downloaded = bundles.downloaded;
      document.querySelector<HTMLElement>("#analysis-status")!.hidden = true; renderResults();
    } catch (caught) { document.querySelector<HTMLElement>("#analysis-status")!.hidden = true; error.textContent = (caught as Error).name === "AbortError" ? "Measurement cancelled." : (caught as Error).message; }
  });
  document.querySelector("#copy-link")?.addEventListener("click", async () => { await navigator.clipboard.writeText(state.demo ? `${location.origin}/demo` : location.href); document.querySelector("#copy-status")!.textContent = "Report link copied."; });
  document.querySelector("#copy-badge")?.addEventListener("click", async () => { const values = badgeValues(); await navigator.clipboard.writeText(`<img src="${badgeDataUrl(values)}" alt="${escapeHtml(badgeLabel(values))}" />`); document.querySelector("#copy-status")!.textContent = "SVG badge copied."; });
}

document.addEventListener("click", (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-route]");
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const url = new URL(link.href); if (url.origin !== location.origin) return; event.preventDefault(); navigate(`${url.pathname}${url.search}`);
});
addEventListener("popstate", () => renderRoute(true));
renderRoute(currentRoute() !== "home");

if ("serviceWorker" in navigator && import.meta.env.PROD) addEventListener("load", () => {
  const hadController = Boolean(navigator.serviceWorker.controller); const showUpdate = () => { const toast = document.querySelector<HTMLElement>("#update-toast"); if (toast) toast.hidden = false; };
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadController) showUpdate(); });
  navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => registration.addEventListener("updatefound", () => registration.installing?.addEventListener("statechange", () => { if (registration.installing?.state === "installed" && hadController) showUpdate(); }))).catch(() => undefined);
});
