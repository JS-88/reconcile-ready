import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, "../dist");
const read = (file) => readFileSync(resolve(dist, file), "utf8");
const htmlFiles = readdirSync(dist).filter((file) => file.endsWith(".html"));
const pages = Object.fromEntries(htmlFiles.map((file) => [file, read(file)]));

for (const [file, html] of Object.entries(pages)) {
  assert.doesNotMatch(
    html,
    /\[(?:COMPANY NUMBER|REGISTERED OFFICE ADDRESS|ICO REGISTRATION NUMBER)\]/,
    `${file} must not expose unfinished legal placeholders`,
  );
  assert.doesNotMatch(
    html,
    /(?:href|action)="(?:https:\/\/reconcileready\.app)?(?:\.\/|\/)?[^"?#]+\.html(?:[#?"])/,
    `${file} must use clean internal URLs`,
  );

  const slug = file === "index.html" ? "" : file.replace(/\.html$/, "");
  const trailingSlashBase = `https://reconcileready.app/${slug}/`;
  for (const match of html.matchAll(
    /(?:href|src|action)="((?:\.\/|\/)?(?:assets\/|site\.css|app\.js|contact\.php)[^"]*)"/g,
  )) {
    const resolved = new URL(match[1], trailingSlashBase);
    const localPath = match[1].split("?")[0];
    const expectedPath = `/${localPath.replace(/^(?:\.\/|\/)/, "")}`;
    assert.equal(
      resolved.pathname,
      expectedPath,
      `${file} assets and form actions must remain valid if a trailing-slash URL is requested`,
    );
  }
}

for (const [file, html] of Object.entries(pages)) {
  const currentPath =
    file === "index.html" ? "/" : `/${file.replace(/\.html$/, "")}`;
  for (const match of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = match[1];
    if (/^(?:mailto:|tel:|javascript:)/.test(href)) continue;

    const url = new URL(href, `https://reconcileready.app${currentPath}`);
    if (url.origin !== "https://reconcileready.app") continue;

    const pathname = decodeURIComponent(url.pathname);
    const target =
      pathname === "/"
        ? "index.html"
        : `${pathname.replace(/^\//, "").replace(/\/$/, "/index")}${pathname.endsWith(".html") ? "" : ".html"}`;
    assert.ok(
      pages[target],
      `${file} link ${href} must resolve to a shipped page`,
    );

    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert.match(
        pages[target],
        new RegExp(`\\sid="${id}"`),
        `${file} link ${href} must resolve to an element`,
      );
    }
  }
}

const notFound = pages["404.html"];
assert.ok(notFound, "A branded 404 page must ship with the site");
assert.match(notFound, /<meta name="robots" content="noindex"/);
assert.match(notFound, /Reconcile Ready/);
assert.match(notFound, /href="\/"/);

assert.match(
  pages["privacy.html"],
  /Reconcile Ready is operated by J5 Ltd/,
  "The privacy page must identify the confirmed operator without placeholder registration data",
);
assert.match(
  pages["terms.html"],
  /operated by J5 Ltd/,
  "The terms page must identify the confirmed operator without placeholder registration data",
);
assert.doesNotMatch(
  pages["contact.html"],
  /J5 Ltd/,
  "The public contact page must retain the requested brand-only presentation",
);

for (const file of [
  "reconciliation.html",
  "profitability.html",
  "how-it-works.html",
  "contact.html",
]) {
  assert.match(
    pages[file],
    /class="page-hero page-hero--visual"/,
    `${file} must balance its hero with a useful visual summary`,
  );
}

for (const file of [
  "reconciliation.html",
  "profitability.html",
  "how-it-works.html",
]) {
  const tableCount = (pages[file].match(/class="detail-table-scroll"/g) || [])
    .length;
  const hintCount = (pages[file].match(/class="table-scroll-hint"/g) || [])
    .length;
  assert.equal(
    hintCount,
    tableCount,
    `${file} must explain that every wide table can be scrolled on mobile`,
  );
}

const css = read("site.css");
assert.match(css, /\.page-hero--visual/);
assert.match(css, /\.hero-summary/);
assert.match(css, /\.table-scroll-hint/);
assert.match(
  css,
  /@media\(max-width:700px\)\{\.table-scroll-hint\{display:flex/,
  "The swipe cue must remain visible until a 620px table fits with page gutters",
);
assert.ok(
  css.lastIndexOf(".dash-head .micro{font-size:8px") >
    css.lastIndexOf(".dash-head .micro{font-size:6px"),
  "The final mobile dashboard rule must keep microcopy at 8px or larger",
);
assert.ok(
  css.lastIndexOf(".wide-preview .metrics small{font-size:8px") >
    css.lastIndexOf(".wide-preview .metrics small{font-size:6px"),
  "The final wide-preview rule must keep metric labels at 8px or larger",
);
assert.match(css, /@media\(max-width:360px\)/);

console.log("Site polish regression checks passed.");
