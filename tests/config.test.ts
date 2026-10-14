import { describe, expect, it } from 'vitest';
import { configurationSchema } from '../src/composition/config.js';

describe('configuration policy gates', () => {
  it('keeps local image recognition disabled by default', () => {
    const parsed = configurationSchema.parse({
      version: 1,
      sessions: {
        browser: { adapter: 'playwright-cdp', endpoint: 'http://127.0.0.1:9222' }
      }
    });
    const browser = parsed.sessions.browser;
    expect(browser?.adapter).toBe('playwright-cdp');
    if (browser?.adapter !== 'playwright-cdp') throw new Error('Expected Playwright CDP configuration.');
    expect(browser.allowLocalImageText).toBe(false);
    expect(browser.allowProviderTestAutomation).toBe(false);
    expect(browser.authorizedOrigins).toEqual([]);
  });

  it('accepts an explicit local-processing gate for a named session', () => {
    const parsed = configurationSchema.parse({
      version: 1,
      sessions: {
        browser: {
          adapter: 'playwright-cdp',
          endpoint: 'http://127.0.0.1:9222',
          allowLocalImageText: true,
          allowProviderTestAutomation: true,
          submitSelector: 'button[type="submit"]',
          authorizedOrigins: ['https://fixture.test']
        }
      }
    });
    const browser = parsed.sessions.browser;
    expect(browser?.adapter).toBe('playwright-cdp');
    if (browser?.adapter !== 'playwright-cdp') throw new Error('Expected Playwright CDP configuration.');
    expect(browser.allowLocalImageText).toBe(true);
    expect(browser.allowProviderTestAutomation).toBe(true);
  });
});
