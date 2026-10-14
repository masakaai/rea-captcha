import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { chromium } from 'playwright';

export const webDemoCases = [
  { provider: 'recaptcha', path: '/recaptcha.html', kind: 'recaptcha', label: 'Google reCAPTCHA v2' },
  { provider: 'turnstile', path: '/turnstile.html', kind: 'turnstile', label: 'Cloudflare Turnstile' },
  { provider: 'hcaptcha', path: '/hcaptcha.html', kind: 'hcaptcha', label: 'hCaptcha' },
  { provider: 'image-text', path: '/image-text.html', kind: 'image-text', label: 'Owned image/text' }
];

const exists = async path => {
  try { await access(path, constants.X_OK); return true; } catch { return false; }
};

export const launchBrowser = async () => {
  const candidates = process.platform === 'darwin'
    ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium']
    : [];
  for (const executablePath of candidates) {
    if (await exists(executablePath)) return chromium.launch({ headless: true, executablePath });
  }
  return chromium.launch({ headless: true });
};

export const waitForToken = async (page, name) => {
  await page.waitForFunction(field => {
    const element = document.querySelector(`[name="${field}"]`);
    return element && 'value' in element && element.value.length > 0;
  }, name, { timeout: 30_000 });
};

export const waitForChallenge = async (page, provider) => {
  if (provider === 'recaptcha') {
    await page.frameLocator('iframe[title*="reCAPTCHA"]').locator('#recaptcha-anchor').waitFor({ state: 'visible', timeout: 30_000 });
  } else if (provider === 'hcaptcha') {
    await page.frameLocator('iframe[title="Widget containing checkbox for hCaptcha security challenge"]').locator('#checkbox').waitFor({ state: 'visible', timeout: 30_000 });
  } else if (provider === 'turnstile') {
    await waitForToken(page, 'cf-turnstile-response');
  } else {
    await page.locator('input[name="captcha_code"]').waitFor({ state: 'visible' });
  }
};

export const satisfyChallenge = async (page, provider) => {
  if (provider === 'recaptcha') {
    await page.frameLocator('iframe[title*="reCAPTCHA"]').locator('#recaptcha-anchor').click();
    await waitForToken(page, 'g-recaptcha-response');
  } else if (provider === 'hcaptcha') {
    await page.frameLocator('iframe[title="Widget containing checkbox for hCaptcha security challenge"]').locator('#checkbox').click();
    await waitForToken(page, 'h-captcha-response');
  } else if (provider === 'turnstile') {
    await waitForToken(page, 'cf-turnstile-response');
  } else {
    await page.locator('input[name="captcha_code"]').fill('LOCAL42');
  }
};

export const submitChallenge = async page => {
  await page.getByRole('button', { name: 'Validate protected action' }).click();
  await page.waitForURL('**/passed?case=*', { timeout: 30_000 });
};

export const completeChallenge = async (page, provider) => {
  await satisfyChallenge(page, provider);
  await submitChallenge(page);
};
