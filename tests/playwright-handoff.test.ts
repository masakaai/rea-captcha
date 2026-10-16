import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { ChallengeController } from '../src/application/controller.js';
import { PlaywrightChallengeAdapter } from '../src/browser/playwright.js';

describe('Playwright handoff acceptance', () => {
  it('preserves the page and browser state across human handoff and resume', async () => {
    const systemChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const browser = await chromium.launch({
      headless: true,
      ...(process.platform === 'darwin' && existsSync(systemChrome) ? { executablePath: systemChrome } : {})
    });
    try {
      const context = await browser.newContext();
      await context.addCookies([{ name: 'workflow', value: 'kept', domain: 'fixture.test', path: '/' }]);
      await context.route('https://fixture.test/**', async route => route.fulfill({
        contentType: 'text/html',
        body: `<!doctype html><title>Checkout</title>
          <main><div class="cf-turnstile">Verify you are human</div><button>Continue</button></main>`
      }));
      const page = await context.newPage();
      await page.goto('https://fixture.test/');
      const pause = vi.fn();
      const resume = vi.fn();
      const controller = new ChallengeController({
        browser: new PlaywrightChallengeAdapter({ id: 'playwright-case', page }),
        lifecycle: { pause, resume }
      });

      expect((await controller.inspect()).finding.kind).toBe('turnstile');
      const handoff = await controller.handoff({ taskId: 'checkout-run' });
      await page.locator('.cf-turnstile').evaluate(element => element.remove());
      await page.locator('main').evaluate(element => element.setAttribute('data-captcha-status', 'passed'));
      await controller.wait({ timeoutMs: 1_000, pollMs: 25 });
      await controller.resume({ taskId: 'checkout-run', handoffId: handoff.handoff.id });

      expect(pause).toHaveBeenCalledOnce();
      expect(resume).toHaveBeenCalledOnce();
      expect(controller.state).toBe('resumed');
      expect(await page.title()).toBe('Checkout');
      expect((await context.cookies()).find(cookie => cookie.name === 'workflow')?.value).toBe('kept');
    } finally {
      await browser.close();
    }
  }, 20_000);
});
