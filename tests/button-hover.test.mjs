import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, '../dist/site.css'), 'utf8');

const rules = selector => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...css.matchAll(new RegExp(`${escaped}\\{([^}]*)\\}`, 'g'))].map(match => match[1]);
};

const lastRule = selector => {
  const matches = rules(selector);
  assert.ok(matches.length, `Expected a CSS rule for ${selector}`);
  return matches.at(-1);
};

const ruleContaining = (selector, pattern) => {
  const match = rules(selector).find(rule => pattern.test(rule));
  assert.ok(match, `Expected ${selector} to include ${pattern}`);
  return match;
};

const button = ruleContaining('.button', /transition:/);
const buttonHover = ruleContaining('.button:hover', /translateY\(-2px\)/);
const primaryHover = lastRule('.primary:hover');
const navCta = ruleContaining('.nav-cta', /transition:/);
const navCtaHover = ruleContaining('.nav-cta:hover', /translateY\(-2px\)/);

assert.match(button, /transition:[^;]*(?:background|background-color)[^;]*transform/);
assert.match(navCta, /transition:[^;]*(?:background|background-color)[^;]*transform/);
assert.match(buttonHover, /transform:translateY\(-2px\)/);
assert.match(navCtaHover, /transform:translateY\(-2px\)/);
assert.match(primaryHover, /background(?:-color)?:#f6ff93/);
assert.match(navCtaHover, /background(?:-color)?:#f6ff93/);
assert.doesNotMatch(navCtaHover, /background(?:-color)?:#ffffff12/);
assert.match(css, /\.button:active,\.nav-cta:active\{[^}]*transform:translateY\(0\)/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\.button:hover,\.nav-cta:hover\{transform:none\}\}/);

console.log('Button hover regression checks passed.');
