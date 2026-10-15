#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const files = new Map([
  ['/', 'index.html'],
  ['/recaptcha.html', 'recaptcha.html'],
  ['/turnstile.html', 'turnstile.html'],
  ['/hcaptcha.html', 'hcaptcha.html'],
  ['/image-text.html', 'image-text.html'],
  ['/demo.js', 'demo.js'],
  ['/styles.css', 'styles.css'],
  ['/social-preview.png', 'social-preview.png']
]);
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.png', 'image/png']
]);

const testCredentials = {
  recaptcha: {
    endpoint: 'https://www.google.com/recaptcha/api/siteverify',
    secret: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
    field: 'g-recaptcha-response'
  },
  turnstile: {
    endpoint: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    secret: '1x0000000000000000000000000000000AA',
    field: 'cf-turnstile-response'
  },
  hcaptcha: {
    endpoint: 'https://api.hcaptcha.com/siteverify',
    secret: '0x0000000000000000000000000000000000000000',
    field: 'h-captcha-response',
    sitekey: '10000000-ffff-ffff-ffff-000000000001'
  }
};

const send = (response, status, body, type = 'application/json; charset=utf-8') => {
  response.writeHead(status, {
    'content-type': type,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  response.end(body);
};

const readBody = request => new Promise((resolve, reject) => {
  let body = '';
  request.setEncoding('utf8');
  request.on('data', chunk => {
    body += chunk;
    if (body.length > 65_536) reject(new Error('Request body exceeds 64 KiB.'));
  });
  request.on('end', () => resolve(body));
  request.on('error', reject);
});

async function verifyVendor(provider, values) {
  const credential = testCredentials[provider];
  const token = values.get(credential.field);
  if (!token) return { success: false, errors: ['missing-token'] };
  const payload = new URLSearchParams({ secret: credential.secret, response: token });
  if (credential.sitekey) payload.set('sitekey', credential.sitekey);
  const remote = await fetch(credential.endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: payload,
    signal: AbortSignal.timeout(15_000)
  });
  if (!remote.ok) return { success: false, errors: [`upstream-http-${remote.status}`] };
  const result = await remote.json();
  return {
    success: result.success === true,
    errors: Array.isArray(result['error-codes']) ? result['error-codes'] : []
  };
}

const passedPage = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Verification complete</title><link rel="stylesheet" href="/styles.css"></head>
<body class="case-page"><main class="case-shell"><nav class="case-nav"><a class="mini-mark" href="/">REA CAPTCHA</a><span class="status-pill">fresh evidence: passed</span></nav>
<section class="card" data-captcha-status="passed"><p class="eyebrow">SERVER VALIDATED</p>
<h1>the agent can continue.</h1><p>The protected demo action was accepted by its validation boundary. The same browser session is ready for the original task.</p>
<a class="back-link" href="/">← back to all four cases</a></section></main></body></html>`;

export async function handleDemoRequest(request, response) {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    const isRead = request.method === 'GET' || request.method === 'HEAD';
    if (isRead && url.pathname === '/passed') {
      send(response, 200, passedPage, 'text/html; charset=utf-8');
      return;
    }
    if (request.method === 'POST' && url.pathname.startsWith('/verify/')) {
      const provider = url.pathname.slice('/verify/'.length);
      const values = new URLSearchParams(await readBody(request));
      const result = provider === 'image-text'
        ? { success: values.get('captcha_code')?.trim().toUpperCase() === 'LOCAL42', errors: [] }
        : provider in testCredentials
          ? await verifyVendor(provider, values)
          : { success: false, errors: ['unknown-provider'] };
      send(response, result.success ? 200 : 403, JSON.stringify(result));
      return;
    }
    if (!isRead || !files.has(url.pathname)) {
      send(response, 404, JSON.stringify({ success: false, errors: ['not-found'] }));
      return;
    }
    const name = files.get(url.pathname);
    const body = await readFile(join(root, name));
    response.setHeader('set-cookie', 'rea_demo_session=kept; Path=/; SameSite=Lax');
    send(response, 200, body, contentTypes.get(extname(name)) ?? 'application/octet-stream');
  } catch (error) {
    send(response, 500, JSON.stringify({ success: false, errors: [error instanceof Error ? error.message : String(error)] }));
  }
}

export async function startDemoServer({ port = 4173, host = '127.0.0.1' } = {}) {
  const server = createServer(handleDemoRequest);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : port;
  return {
    server,
    port: actualPort,
    origin: `http://${host}:${actualPort}`,
    close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const requested = Number(process.env.REA_CAPTCHA_DEMO_PORT ?? process.argv[2] ?? 4173);
  const running = await startDemoServer({ port: requested });
  process.stdout.write(`rea-captcha web demo: ${running.origin}\n`);
  const close = async () => { await running.close(); process.exit(0); };
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}
