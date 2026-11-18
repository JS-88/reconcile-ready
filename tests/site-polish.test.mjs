import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '../dist');
const read = file => readFileSync(resolve(dist, file), 'utf8');
const htmlFiles = readdirSync(dist).filter(file => file.endsWith('.html'));
const pages = Object.fromEntries(htmlFiles.map(file => [file, read(file)]));

for (const [file, html] of Object.entries(pages)) {
  assert.doesNotMatch(
    html,
    /\[(?:COMPANY NUMBER|REGISTERED OFFICE ADDRESS|ICO REGISTRATION NUMBER)\]/,
    `${file} must not expose unfinished legal placeholders`,
  );
  assert.doesNotMatch(
    html,
    /(?:href|action)="(?:\.\/)?(?:index|reconciliation|profitability|how-it-works|contact|help|security|amazon-data|privacy|terms)\.html(?:[#?"])/,
    `${file} must use clean internal URLs`,
  );
}

const notFound = pages['404.html'];
assert.ok(notFound, 'A branded 404 page must ship with the site');
assert.match(notFound, /<meta name="robots" content="noindex"/);
assert.match(notFound, /Reconcile Ready/);
assert.match(notFound, /href="\/"/);

for (const file of ['reconciliation.html', 'profitability.html', 'how-it-works.html', 'contact.html']) {
  assert.match(
    pages[file],
    /class="page-hero page-hero--visual"/,
    `${file} must balance its hero with a useful visual summary`,
  );
}

for (const file of ['reconciliation.html', 'profitability.html', 'how-it-works.html']) {
  const tableCount = (pages[file].match(/class="detail-table-scroll"/g) || []).length;
  const hintCount = (pages[file].match(/class="table-scroll-hint"/g) || []).length;
  assert.equal(
    hintCount,
    tableCount,
    `${file} must explain that every wide table can be scrolled on mobile`,
  );
}

const css = read('site.css');
assert.match(css, /\.page-hero--visual/);
assert.match(css, /\.hero-summary/);
assert.match(css, /\.table-scroll-hint/);
assert.ok(
  css.lastIndexOf('.dash-head .micro{font-size:8px') >
    css.lastIndexOf('.dash-head .micro{font-size:6px'),
  'The final mobile dashboard rule must keep microcopy at 8px or larger',
);
assert.ok(
  css.lastIndexOf('.wide-preview .metrics small{font-size:8px') >
    css.lastIndexOf('.wide-preview .metrics small{font-size:6px'),
  'The final wide-preview rule must keep metric labels at 8px or larger',
);
assert.match(css, /@media\(max-width:360px\)/);

console.log('Site polish regression checks passed.');
