import type { BrowserChallengeActionPort } from '../application/ports.js';
import type { ChallengeInspection, ChallengeObservation } from '../domain/challenge.js';
import { browserObservationExpression } from '../detector/browser-expression.js';
import { parseObservation } from './observation.js';

interface PlaywrightLocatorPort {
  click(options?: { timeout?: number }): Promise<void>;
  fill(value: string, options?: { timeout?: number }): Promise<void>;
  inputValue(options?: { timeout?: number }): Promise<string>;
}

interface PlaywrightFrameLocatorPort {
  locator(selector: string): PlaywrightLocatorPort;
}

export interface PlaywrightPagePort {
  evaluate<R>(expression: string): Promise<R>;
  frameLocator(selector: string): PlaywrightFrameLocatorPort;
  locator(selector: string): PlaywrightLocatorPort;
}

export interface PlaywrightAgentActionOptions {
  readonly authorizedOrigins: readonly string[];
  readonly allowProviderTestAutomation?: boolean;
  readonly submitSelector?: string;
  readonly imageTextValue?: string;
}

const providerTestKeys = {
  recaptcha: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  turnstile: '1x00000000000000000000AA',
  hcaptcha: '10000000-ffff-ffff-ffff-000000000001'
} as const;

const tokenFields = {
  recaptcha: 'g-recaptcha-response',
  turnstile: 'cf-turnstile-response',
  hcaptcha: 'h-captcha-response'
} as const;

const hcaptchaCheckboxFrame = 'iframe[src*="hcaptcha.com"][src*="frame=checkbox"]';
const navigationObservationRetries = 2;

const normalizeOrigins = (values: readonly string[]): ReadonlySet<string> => new Set(values.map(value => new URL(value).origin));
const isTransientNavigationError = (error: unknown): boolean => error instanceof Error
  && /Execution context was destroyed|Cannot find context with specified id/i.test(error.message);

const waitForNavigationContext = (signal?: AbortSignal): Promise<void> => new Promise((resolve, reject) => {
  if (signal?.aborted) return reject(signal.reason ?? new Error('Aborted'));
  const timer = setTimeout(done, 25);
  const aborted = () => {
    clearTimeout(timer);
    signal?.removeEventListener('abort', aborted);
    reject(signal?.reason ?? new Error('Aborted'));
  };
  function done() {
    signal?.removeEventListener('abort', aborted);
    resolve();
  }
  signal?.addEventListener('abort', aborted, { once: true });
});

export class PlaywrightChallengeAdapter implements BrowserChallengeActionPort {
  readonly id: string;
  readonly #page: PlaywrightPagePort;
  readonly #agentActions: PlaywrightAgentActionOptions | null;
  readonly #authorizedOrigins: ReadonlySet<string>;

  constructor({ id, page, agentActions }: { id: string; page: PlaywrightPagePort; agentActions?: PlaywrightAgentActionOptions }) {
    if (!id) throw new Error('Playwright adapter id is required.');
    this.id = id;
    this.#page = page;
    this.#agentActions = agentActions ?? null;
    this.#authorizedOrigins = normalizeOrigins(agentActions?.authorizedOrigins ?? []);
  }

  async observe(signal?: AbortSignal): Promise<ChallengeObservation> {
    for (let attempt = 0; attempt <= navigationObservationRetries; attempt += 1) {
      if (signal?.aborted) throw signal.reason ?? new Error('Aborted');
      try {
        const evaluation = this.#page.evaluate<unknown>(browserObservationExpression);
        let abort: (() => void) | undefined;
        const value = signal ? await Promise.race([
          evaluation,
          new Promise<never>((_resolve, reject) => {
            abort = () => reject(signal.reason ?? new Error('Aborted'));
            signal.addEventListener('abort', abort, { once: true });
          })
        ]).finally(() => {
          if (abort) signal.removeEventListener('abort', abort);
        }) : await evaluation;
        return parseObservation(value);
      } catch (error) {
        if (!isTransientNavigationError(error) || attempt === navigationObservationRetries) throw error;
        await waitForNavigationContext(signal);
      }
    }
    throw new Error('Browser observation retry loop ended unexpectedly.');
  }

  async completeAuthorizedChallenge(inspection: ChallengeInspection, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) throw signal.reason ?? new Error('Aborted');
    const options = this.#agentActions;
    if (!options) throw new Error('Authorized agent actions are not configured for this Playwright session.');
    const currentUrl = await this.#page.evaluate<string>('location.href');
    const origin = new URL(currentUrl).origin;
    if (origin !== new URL(inspection.finding.url).origin) {
      throw new Error('The browser origin changed after inspection; inspect again before an agent action.');
    }
    if (!this.#authorizedOrigins.has(origin)) throw new Error(`Agent challenge action is not authorized for origin: ${origin}`);

    const kind = inspection.finding.kind;
    if (kind === 'recaptcha' || kind === 'turnstile' || kind === 'hcaptcha') {
      if (options.allowProviderTestAutomation !== true) {
        throw new Error('Provider test automation is disabled for this Playwright session.');
      }
      await this.#requireProviderTestKey(kind);
      if (kind === 'recaptcha') {
        await this.#page.frameLocator('iframe[title*="reCAPTCHA"]').locator('#recaptcha-anchor').click({ timeout: 30_000 });
      } else if (kind === 'hcaptcha') {
        await this.#page.frameLocator(hcaptchaCheckboxFrame).locator('#checkbox').click({ timeout: 30_000 });
      }
      await this.#waitForToken(tokenFields[kind], signal);
    } else if (kind === 'image-text') {
      if (!options.imageTextValue) throw new Error('No authorized image/text value was configured for this session.');
      await this.#page.locator('input[name="captcha_code"], input[id*="captcha" i], input[class*="captcha" i]').fill(options.imageTextValue, { timeout: 30_000 });
    } else {
      throw new Error(`Agent completion is not supported for challenge kind: ${kind ?? 'unknown'}`);
    }

    if (options.submitSelector) {
      await this.#page.locator(options.submitSelector).click({ timeout: 30_000 });
    }
  }

  async #requireProviderTestKey(kind: keyof typeof providerTestKeys): Promise<void> {
    const selector = kind === 'recaptcha' ? '.g-recaptcha' : kind === 'turnstile' ? '.cf-turnstile' : '.h-captcha';
    const actual = await this.#page.evaluate<string>(`document.querySelector(${JSON.stringify(selector)})?.getAttribute('data-sitekey') ?? ''`);
    if (actual !== providerTestKeys[kind]) {
      throw new Error(`${kind} agent action requires the provider's documented non-production test sitekey.`);
    }
  }

  async #waitForToken(name: string, signal?: AbortSignal): Promise<void> {
    const field = this.#page.locator(`[name="${name}"]`);
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      if (signal?.aborted) throw signal.reason ?? new Error('Aborted');
      try {
        if ((await field.inputValue({ timeout: 250 })).length > 0) return;
      } catch {
        // The provider may still be mounting its response field.
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Provider test token ${name} was not ready within 30000 ms.`);
  }
}
