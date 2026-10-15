#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import demoHandler from '../api/index.mjs';

assert.equal(typeof demoHandler, 'function', 'The Vercel entrypoint must export a request handler.');

const server = createServer((request, response) => {
  Promise.resolve(demoHandler(request, response)).catch(error => {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(error instanceof Error ? error.message : String(error));
  });
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});

const address = server.address();
assert(address && typeof address === 'object');
const origin = `http://127.0.0.1:${address.port}`;

try {
  const index = await fetch(`${origin}/`);
  assert.equal(index.status, 200);
  const indexHtml = await index.text();
  assert.match(indexHtml, /keep browser-use/);
  assert.match(indexHtml, /browser-use handoff/);
  assert.match(indexHtml, /npx -y rea-captcha mcp --stateless/);
  assert.match(indexHtml, /https:\/\/github\.com\/masakaai\/rea-captcha/);
  assert.match(indexHtml, /live provider matrix/);
  assert.match(indexHtml, /og:image:width" content="1280"/);
  assert.match(indexHtml, /og:image:height" content="640"/);
  assert.equal((indexHtml.match(/href="\/(?:recaptcha|turnstile|hcaptcha|image-text)\.html"/g) ?? []).length, 4);
  assert.match(index.headers.get('set-cookie') ?? '', /rea_demo_session=kept/);

  const socialPreview = Buffer.from(await (await fetch(`${origin}/social-preview.png`)).arrayBuffer());
  assert.equal(socialPreview.toString('ascii', 1, 4), 'PNG');
  assert.equal(socialPreview.readUInt32BE(16), 1280, 'Social preview must be 1280 px wide.');
  assert.equal(socialPreview.readUInt32BE(20), 640, 'Social preview must be 640 px tall.');

  for (const path of ['/', '/recaptcha.html', '/turnstile.html', '/hcaptcha.html', '/image-text.html', '/demo.js', '/styles.css', '/social-preview.svg', '/social-preview.png', '/passed', '/not-a-demo']) {
    const get = await fetch(`${origin}${path}`);
    await get.arrayBuffer();
    const head = await fetch(`${origin}${path}`, { method: 'HEAD' });
    assert.equal(head.status, get.status, `HEAD status must match GET for ${path}`);
    for (const header of ['content-type', 'cache-control', 'x-content-type-options', 'set-cookie']) {
      assert.equal(head.headers.get(header), get.headers.get(header), `HEAD ${header} must match GET for ${path}`);
    }
    assert.equal(await head.text(), '', `HEAD must not return a body for ${path}`);
  }
  const headVerification = await fetch(`${origin}/verify/image-text`, { method: 'HEAD' });
  assert.equal(headVerification.status, 404, 'HEAD must not run a verification action.');

  const provider = await fetch(`${origin}/turnstile.html`);
  assert.equal(provider.status, 200);
  assert.match(await provider.text(), /challenges\.cloudflare\.com\/turnstile/);

  const rejected = await fetch(`${origin}/verify/image-text`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ captcha_code: 'WRONG' })
  });
  assert.equal(rejected.status, 403);
  assert.deepEqual(await rejected.json(), { success: false, errors: [] });

  const accepted = await fetch(`${origin}/verify/image-text`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ captcha_code: 'LOCAL42' })
  });
  assert.equal(accepted.status, 200);
  assert.deepEqual(await accepted.json(), { success: true, errors: [] });

  const missing = await fetch(`${origin}/not-a-demo`);
  assert.equal(missing.status, 404);
} finally {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

process.stdout.write('Verified the Vercel demo handler and owned verification boundary.\n');
