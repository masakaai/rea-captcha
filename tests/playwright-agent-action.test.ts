import { describe, expect, it, vi } from 'vitest';
import type { ChallengeInspection } from '../src/domain/challenge.js';
import { PlaywrightChallengeAdapter, type PlaywrightPagePort } from '../src/browser/playwright.js';

const inspection = (url = 'https://fixture.test/checkout', kind: ChallengeInspection['finding']['kind'] = 'recaptcha'): ChallengeInspection => ({
  finding: {
    status: 'detected',
    kind,
    confidence: 0.99,
    url,
    title: 'Fixture',
    evidence: [],
    inspectedAt: new Date().toISOString()
  },
  policy: {
    decision: 'agent-action',
    reason: 'Authorized test.',
    origin: new URL(url).origin
  }
});

class FakePage implements PlaywrightPagePort {
  readonly checkboxClick = vi.fn(async () => {});
  readonly submitClick = vi.fn(async () => {});
  readonly fill = vi.fn(async () => {});
  sitekey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
  url = 'https://fixture.test/checkout';
  frameSelector = '';
  transientObservationFailures = 0;
  observationAttempts = 0;
  observationError: Error | null = null;

  async evaluate<R>(expression: string): Promise<R> {
    if (expression === 'location.href') return this.url as R;
    if (expression.startsWith('document.querySelector')) return this.sitekey as R;
    this.observationAttempts += 1;
    if (this.transientObservationFailures > 0) {
      this.transientObservationFailures -= 1;
      throw new Error('Execution context was destroyed, most likely because of a navigation');
    }
    if (this.observationError) throw this.observationError;
    return JSON.stringify({
      url: 'https://fixture.test/checkout',
      title: 'Fixture',
      html: '<div class="g-recaptcha"></div>',
      capturedAt: new Date().toISOString()
    }) as R;
  }

  frameLocator(selector: string) {
    this.frameSelector = selector;
    return {
      locator: () => ({
        click: this.checkboxClick,
        fill: this.fill,
        inputValue: async () => ''
      })
    };
  }

  locator(selector: string) {
    return {
      click: selector === 'button[type="submit"]' ? this.submitClick : this.checkboxClick,
      fill: this.fill,
      inputValue: async () => selector.includes('captcha-response') ? 'test-token' : ''
    };
  }
}

describe('Playwright authorized agent actions', () => {
  it('clicks and submits a documented provider test widget in an authorized existing page', async () => {
    const page = new FakePage();
    const adapter = new PlaywrightChallengeAdapter({
      id: 'existing-page',
      page,
      agentActions: {
        authorizedOrigins: ['https://fixture.test'],
        allowProviderTestAutomation: true,
        submitSelector: 'button[type="submit"]'
      }
    });

    await adapter.completeAuthorizedChallenge(inspection());

    expect(page.checkboxClick).toHaveBeenCalledOnce();
    expect(page.submitClick).toHaveBeenCalledOnce();
  });

  it('rejects provider production keys before clicking', async () => {
    const page = new FakePage();
    page.sitekey = 'production-key';
    const adapter = new PlaywrightChallengeAdapter({
      id: 'existing-page',
      page,
      agentActions: {
        authorizedOrigins: ['https://fixture.test'],
        allowProviderTestAutomation: true
      }
    });

    await expect(adapter.completeAuthorizedChallenge(inspection())).rejects.toThrow('documented non-production test sitekey');
    expect(page.checkboxClick).not.toHaveBeenCalled();
  });

  it('rejects an origin outside the exact allowlist before clicking', async () => {
    const page = new FakePage();
    page.url = 'https://elsewhere.test/';
    const adapter = new PlaywrightChallengeAdapter({
      id: 'existing-page',
      page,
      agentActions: {
        authorizedOrigins: ['https://fixture.test'],
        allowProviderTestAutomation: true
      }
    });

    await expect(adapter.completeAuthorizedChallenge(inspection('https://elsewhere.test/'))).rejects.toThrow('not authorized');
    expect(page.checkboxClick).not.toHaveBeenCalled();
  });

  it('uses a locale-independent hCaptcha checkbox frame selector', async () => {
    const page = new FakePage();
    page.sitekey = '10000000-ffff-ffff-ffff-000000000001';
    const adapter = new PlaywrightChallengeAdapter({
      id: 'existing-page',
      page,
      agentActions: {
        authorizedOrigins: ['https://fixture.test'],
        allowProviderTestAutomation: true
      }
    });
    await adapter.completeAuthorizedChallenge(inspection('https://fixture.test/checkout', 'hcaptcha'));

    expect(page.frameSelector).toBe('iframe[src*="hcaptcha.com"][src*="frame=checkbox"]');
    expect(page.checkboxClick).toHaveBeenCalledOnce();
  });

  it('retries a fresh observation when navigation destroys the page execution context', async () => {
    const page = new FakePage();
    page.transientObservationFailures = 1;
    const adapter = new PlaywrightChallengeAdapter({ id: 'existing-page', page });

    await expect(adapter.observe()).resolves.toMatchObject({
      url: 'https://fixture.test/checkout',
      title: 'Fixture'
    });
    expect(page.observationAttempts).toBe(2);
  });

  it('does not retry non-navigation observation errors', async () => {
    const page = new FakePage();
    page.observationError = new Error('Page evaluation failed');
    const adapter = new PlaywrightChallengeAdapter({ id: 'existing-page', page });

    await expect(adapter.observe()).rejects.toThrow('Page evaluation failed');
    expect(page.observationAttempts).toBe(1);
  });

  it('stops a navigation retry when the caller aborts', async () => {
    const page = new FakePage();
    page.transientObservationFailures = 1;
    const adapter = new PlaywrightChallengeAdapter({ id: 'existing-page', page });
    const controller = new AbortController();

    const observation = adapter.observe(controller.signal);
    controller.abort(new Error('Stopped'));

    await expect(observation).rejects.toThrow('Stopped');
    expect(page.observationAttempts).toBe(1);
  });
});
