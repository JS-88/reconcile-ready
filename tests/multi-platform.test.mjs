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
    /AMAZON UK · SAMPLE SETTLEMENT/,
    `${file} must use a channel-neutral payout example`,
  );
}

assert.match(pages["index.html"], /class="channel-bridge-map"/);
assert.match(pages["index.html"], /href="\/amazon"/);
assert.match(pages["index.html"], /href="\/ebay"/);
assert.match(pages["index.html"], /href="\/shopify"/);

console.log("Multi-platform architecture regression checks passed.");
