#!/usr/bin/env node
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { ChallengeController, ChallengePolicy } from '../dist/index.js';
import { PlaywrightChallengeAdapter } from '../dist/browser/playwright.js';
import { startDemoServer } from '../examples/web-demo/server.mjs';
import { launchBrowser, satisfyChallenge, submitChallenge, waitForChallenge, webDemoCases } from './web-demo-harness.mjs';

const outputDirectory = resolve('docs/assets/demos');
const run = (command, args) => new Promise((resolvePromise, reject) => {
  const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk; });
  child.once('error', reject);
  child.once('close', code => code === 0 ? resolvePromise() : reject(new Error(`${command} exited ${code}: ${stderr}`)));
});

const annotate = async (page, heading, detail) => {
  await page.evaluate(({ heading, detail }) => {
    document.querySelector('#rea-captcha-proof')?.remove();
    const proof = document.createElement('aside');
    proof.id = 'rea-captcha-proof';
    proof.setAttribute('aria-label', 'rea-captcha verification evidence');
    Object.assign(proof.style, {
      position: 'fixed', top: '18px', right: '18px', zIndex: '2147483647', width: '300px',
      padding: '13px 15px', borderRadius: '12px', background: '#10212bf2', color: '#fff',
      boxShadow: '0 12px 32px #10212b42', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
    });
    const title = document.createElement('strong');
    title.textContent = heading;
    Object.assign(title.style, { display: 'block', color: '#6ee7d8', fontSize: '13px', letterSpacing: '.06em' });
    const body = document.createElement('span');
    body.textContent = detail;
    Object.assign(body.style, { display: 'block', marginTop: '5px', fontSize: '13px', lineHeight: '1.4' });
    proof.append(title, body);
    document.body.append(proof);
  }, { heading, detail });
};

const renderGif = async (frames, output) => {
  const list = join(frames, 'frames.txt');
  const lines = [
    "file '00.png'", 'duration 1.35',
    "file '01.png'", 'duration 1.35',
    "file '02.png'", 'duration 1.35',
    "file '03.png'", 'duration 2.20',
    "file '03.png'"
  ];
  await writeFile(list, `${lines.join('\n')}\n`);
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list,
    '-vf', 'fps=8,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle',
    '-loop', '0', output
  ]);
};

await mkdir(outputDirectory, { recursive: true });
const temporaryRoot = await mkdtemp(join(tmpdir(), 'rea-captcha-demos-'));
const demo = await startDemoServer({ port: 0 });
const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 1000, height: 720 }, deviceScaleFactor: 1 });
const publicOrigin = `http://rea-captcha.localtest.me:${demo.port}`;
const results = [];

try {
  for (const testCase of webDemoCases) {
    const frames = join(temporaryRoot, testCase.provider);
    await mkdir(frames);
    const page = await context.newPage();
    await page.goto(`${publicOrigin}${testCase.path}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const controller = new ChallengeController({
      browser: new PlaywrightChallengeAdapter({ id: testCase.provider, page }),
      policy: new ChallengePolicy({
        authorizedOrigins: [publicOrigin],
        allowLocalImageText: testCase.provider === 'image-text'
      })
    });
    const initial = await controller.inspect();
    if (initial.finding.kind !== testCase.kind) throw new Error(`${testCase.provider}: detector mismatch.`);
    await waitForChallenge(page, testCase.provider);
    await annotate(page, '1 · CHALLENGE DETECTED', `${testCase.label} · ${initial.finding.kind}`);
    await page.screenshot({ path: join(frames, '00.png') });

    await controller.handoff();
    await annotate(page, '2 · HUMAN HANDOFF', 'Same browser page and session retained');
    await page.screenshot({ path: join(frames, '01.png') });

    await satisfyChallenge(page, testCase.provider);
    await annotate(page, '3 · RESPONSE READY', 'Submitting through the server validation boundary');
    await page.screenshot({ path: join(frames, '02.png') });
    await submitChallenge(page);
    const cleared = await controller.wait({ timeoutMs: 30_000, pollMs: 100 });
    if (cleared.finding.status !== 'passed') throw new Error(`${testCase.provider}: validated page was not marked passed.`);
    await controller.resume();
    await annotate(page, '4 · VALIDATED + RESUMED', 'Fresh passed evidence · same controller session');
    await page.screenshot({ path: join(frames, '03.png') });

    const output = join(outputDirectory, `${testCase.provider}.gif`);
    await renderGif(frames, output);
    results.push({ provider: testCase.provider, output });
    await page.close();
  }
  process.stdout.write(`${JSON.stringify({ origin: publicOrigin, demos: results }, null, 2)}\n`);
} finally {
  await context.close();
  await browser.close();
  await demo.close();
  await rm(temporaryRoot, { recursive: true, force: true });
}
