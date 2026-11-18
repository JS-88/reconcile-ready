import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const read = path => readFileSync(resolve(here, `../dist/${path}`), 'utf8');
const contact = read('contact.html');
const script = read('app.js');
const privacy = read('privacy.html');
const handler = read('contact.php');

assert.doesNotMatch(contact, /<strong>Company details<\/strong>/);
assert.doesNotMatch(contact, /class="contact-email"/);
assert.match(contact, /<form id="enquiry-form" action="contact\.php" method="post">/);
assert.match(contact, /name="website"[^>]*autocomplete="off"[^>]*tabindex="-1"/);
assert.match(contact, /id="form-status"[^>]*role="status"[^>]*aria-live="polite"/);
assert.match(contact, /<button class="button dark" type="submit">Send enquiry/);
assert.doesNotMatch(contact, /email-ready|download-enquiry|Create my email/);

assert.match(script, /fetch\(form\.action/);
assert.match(
  script,
  /headers:\s*\{\s*(?:['"]Accept['"]|Accept):\s*['"]application\/json['"]\s*\}/,
);
assert.match(script, /form\.reset\(\)/);
assert.doesNotMatch(script, /mailto-enquiry|download-enquiry|window\.location\.href/);

assert.match(handler, /hello@reconcileready\.app/);
assert.match(handler, /REQUEST_METHOD/);
assert.match(handler, /filter_var\([^,]+,\s*FILTER_VALIDATE_EMAIL\)/);
assert.match(handler, /Reply-To/);
assert.match(handler, /mail\(/);
assert.match(handler, /\$_POST\['website'\]/);
assert.match(handler, /Content-Type:\s*application\/json/);

assert.match(privacy, /website enquiry\s+form/);
assert.match(privacy, /hello@reconcileready\.app\s+mailbox/);

console.log('Contact form regression checks passed.');
