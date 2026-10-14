import { chromium } from 'playwright';
import { ChallengeController } from 'rea-captcha';
import { PlaywrightChallengeAdapter } from 'rea-captcha/playwright';

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto(process.env.TARGET_URL ?? 'http://127.0.0.1:4173/turnstile.html');

const controller = new ChallengeController({
  browser: new PlaywrightChallengeAdapter({ id: 'playwright-demo', page }),
  lifecycle: {
    pause: () => { process.stdout.write('Challenge detected. Complete it in the visible browser.\n'); },
    resume: () => { process.stdout.write('Challenge cleared. Agent work can resume.\n'); }
  }
});

try {
  const inspection = await controller.inspect();
  if (inspection.policy.decision !== 'continue') {
    await controller.handoff();
    await controller.wait({ timeoutMs: 120_000, pollMs: 500 });
    await controller.resume();
  }
} finally {
  controller.close();
  await browser.close();
}
