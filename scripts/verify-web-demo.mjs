#!/usr/bin/env node
import { ChallengeController, ChallengePolicy } from '../dist/index.js';
import { PlaywrightChallengeAdapter } from '../dist/browser/playwright.js';
import { startDemoServer } from '../examples/web-demo/server.mjs';
import { completeChallenge, launchBrowser, waitForChallenge, webDemoCases } from './web-demo-harness.mjs';

const demo = await startDemoServer({ port: 0 });
const browser = await launchBrowser();
const context = await browser.newContext();
const publicOrigin = `http://rea-captcha.localtest.me:${demo.port}`;
const results = [];

try {
  for (const testCase of webDemoCases) {
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
    if (initial.finding.kind !== testCase.kind) {
      throw new Error(`${testCase.provider}: expected ${testCase.kind}, found ${initial.finding.kind ?? initial.finding.status}`);
    }
    await waitForChallenge(page, testCase.provider);
    await controller.handoff();
    await completeChallenge(page, testCase.provider);
    const cleared = await controller.wait({ timeoutMs: 30_000, pollMs: 100 });
    if (cleared.finding.status !== 'passed') throw new Error(`${testCase.provider}: server-validated page was not marked passed.`);
    await controller.resume();
    const cookies = await context.cookies(publicOrigin);
    if (!cookies.some(cookie => cookie.name === 'rea_demo_session' && cookie.value === 'kept')) {
      throw new Error(`${testCase.provider}: browser session cookie was not preserved.`);
    }
    results.push({ provider: testCase.provider, detected: initial.finding.kind, validated: true, resumed: true });
    await page.close();
  }
  process.stdout.write(`${JSON.stringify({ origin: publicOrigin, cases: results }, null, 2)}\n`);
} finally {
  await context.close();
  await browser.close();
  await demo.close();
}
