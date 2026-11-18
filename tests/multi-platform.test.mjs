import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, "../dist");
const read = (file) => readFileSync(resolve(dist, file), "utf8");
const htmlFiles = readdirSync(dist).filter((file) => file.endsWith(".html"));
const pages = Object.fromEntries(htmlFiles.map((file) => [file, read(file)]));

for (const file of [
  "platforms.html",
  "amazon.html",
  "ebay.html",
  "shopify.html",
]) {
  assert.ok(pages[file], `${file} must ship as a public platform page`);
}

for (const [file, html] of Object.entries(pages)) {
  const stylesheet = html.match(/<link rel="stylesheet" href="([^"]+)"/);
  assert.ok(stylesheet, `${file} must load the shared stylesheet`);
  const stylesheetUrl = new URL(stylesheet[1], "https://reconcileready.app/");
  assert.equal(stylesheetUrl.pathname, "/site.css");
  assert.ok(
    stylesheetUrl.searchParams.get("v"),
    `${file} must version site.css so new markup cannot load with stale styling`,
  );

  if (file !== "404.html") {
    for (const menuId of ["product-menu", "platforms-menu", "resources-menu"]) {
      assert.match(
        html,
        new RegExp(`aria-controls="${menuId}"`),
        `${file} must use the complete shared navigation`,
      );
    }
    for (const footerHeading of [
      "Explore",
      "Platforms",
      "Get to know us",
      "The details",
    ]) {
      assert.match(
        html,
        new RegExp(`<h2>${footerHeading}</h2>`),
        `${file} must use the complete shared footer`,
      );
    }
    assert.match(
      html,
      /href="\/platforms"/,
      `${file} must link to the platform hub`,
    );
    for (const slug of ["amazon", "ebay", "shopify"]) {
      assert.match(
        html,
        new RegExp(`href="/${slug}"`),
        `${file} must expose ${slug} as an equal platform destination`,
      );
    }
  }
}

for (const [file, slug] of [
  ["amazon.html", "amazon"],
  ["ebay.html", "ebay"],
  ["shopify.html", "shopify"],
]) {
  const html = pages[file];
  assert.match(html, new RegExp(`https://reconcileready\\.app/${slug}`));
  assert.match(html, /class="platform-hero"/);
  assert.match(html, /class="platform-data-grid"/);
  assert.match(html, /class="[^"]*\bplatform-flow\b[^"]*"/);
  assert.match(html, /class="[^"]*\bplatform-limit\b[^"]*"/);
}

for (const file of ["index.html", "reconciliation.html"]) {
  assert.doesNotMatch(
    pages[file],
    /(?:AMAZON UK · SAMPLE SETTLEMENT|Amazon fees)/,
    `${file} must use a channel-neutral payout example`,
  );
  assert.match(pages[file], /CHANNEL-NEUTRAL · SAMPLE PAYOUT/);
}

assert.match(pages["index.html"], /class="channel-bridge-map"/);
assert.match(pages["index.html"], /href="\/amazon"/);
assert.match(pages["index.html"], /href="\/ebay"/);
assert.match(pages["index.html"], /href="\/shopify"/);

for (const file of ["amazon.html", "ebay.html", "shopify.html"]) {
  assert.doesNotMatch(
    pages[file],
    /<b>↗<\/b>/,
    `${file} must hide decorative arrows from assistive technology`,
  );
}

const script = read("app.js");
assert.doesNotMatch(
  script,
  /triggers\[\d+\]/,
  "Dropdown current states must not depend on DOM order",
);
assert.match(script, /setAttribute\("aria-current", "page"\)/);
assert.match(script, /markCurrentMenu\("resources-menu"\)/);
assert.match(script, /markCurrentMenu\("platforms-menu"\)/);

const css = read("site.css");
assert.match(
  css,
  /@media\(prefers-reduced-motion:reduce\)[^{]*\{[^}]*\.platform-card:hover[^}]*transform:none/,
  "Platform hover motion must respect reduced-motion preferences",
);

console.log("Multi-platform architecture regression checks passed.");
