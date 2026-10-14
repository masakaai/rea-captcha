import { describe, expect, it, vi } from 'vitest';
import type { ChallengeInspection } from '../src/domain/challenge.js';
import { PlaywrightChallengeAdapter, type PlaywrightPagePort } from '../src/browser/playwright.js';

const inspection = (url = 'https://fixture.test/checkout'): ChallengeInspection => ({
  finding: {
    status: 'detected',
    kind: 'recaptcha',
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

  async evaluate<R>(expression: string): Promise<R> {
    if (expression === 'location.href') return this.url as R;
    if (expression.startsWith('document.querySelector')) return this.sitekey as R;
    return JSON.stringify({
      url: 'https://fixture.test/checkout',
      title: 'Fixture',
      html: '<div class="g-recaptcha"></div>',
      capturedAt: new Date().toISOString()
    }) as R;
  }

  frameLocator() {
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
      inputValue: async () => selector.includes('g-recaptcha-response') ? 'test-token' : ''
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
});
