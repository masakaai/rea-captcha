import type { Browser, BrowserContext, Page } from 'playwright';
import { PlaywrightChallengeAdapter, type PlaywrightAgentActionOptions } from './playwright.js';

export interface CdpChallengeConnection {
  readonly adapter: PlaywrightChallengeAdapter;
  close(): Promise<void>;
}

const selectPage = (browser: Browser): Page => {
  const contexts: BrowserContext[] = browser.contexts();
  const pages = contexts.flatMap(context => context.pages());
  const page = pages.at(-1);
  if (!page) throw new Error('The CDP browser has no open page.');
  return page;
};

export async function connectCdpChallenge({
  id,
  endpoint,
  headers,
  agentActions
}: {
  id: string;
  endpoint: string;
  headers?: Record<string, string>;
  agentActions?: PlaywrightAgentActionOptions;
}): Promise<CdpChallengeConnection> {
  const { chromium } = await import('playwright');
  const browser = await chromium.connectOverCDP(endpoint, headers ? { headers } : undefined);
  const adapter = new PlaywrightChallengeAdapter({ id, page: selectPage(browser), ...(agentActions ? { agentActions } : {}) });
  return {
    adapter,
    close: async () => {
      // Disconnect from the borrowed browser. Chromium itself remains running.
      await browser.close();
    }
  };
}
