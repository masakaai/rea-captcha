import type { ChallengeFinding, ChallengePolicyDecision } from '../domain/challenge.js';

export interface ChallengePolicyOptions {
  readonly authorizedOrigins?: readonly string[];
  readonly allowLocalImageText?: boolean;
  readonly allowProviderTestAutomation?: boolean;
}

const normalizeOrigin = (value: string): string | null => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

export class ChallengePolicy {
  readonly #authorizedOrigins: ReadonlySet<string>;
  readonly #allowLocalImageText: boolean;
  readonly #allowProviderTestAutomation: boolean;

  constructor(options: ChallengePolicyOptions = {}) {
    this.#authorizedOrigins = new Set((options.authorizedOrigins ?? []).map(normalizeOrigin).filter((value): value is string => Boolean(value)));
    this.#allowLocalImageText = options.allowLocalImageText ?? false;
    this.#allowProviderTestAutomation = options.allowProviderTestAutomation ?? false;
  }

  decide(finding: ChallengeFinding): ChallengePolicyDecision {
    const origin = normalizeOrigin(finding.url);
    if (finding.status === 'clear' || finding.status === 'passed') {
      return { decision: 'continue', reason: 'No active verification challenge was found.', origin };
    }
    if (
      finding.kind === 'image-text' &&
      this.#allowLocalImageText &&
      origin !== null &&
      this.#authorizedOrigins.has(origin)
    ) {
      return {
        decision: 'local-processing',
        reason: 'Local image recognition is enabled for this explicitly authorized origin.',
        origin
      };
    }
    if (
      this.#allowProviderTestAutomation &&
      origin !== null &&
      this.#authorizedOrigins.has(origin) &&
      (finding.kind === 'recaptcha' || finding.kind === 'hcaptcha' || finding.kind === 'turnstile')
    ) {
      return {
        decision: 'agent-action',
        reason: 'Agent interaction is enabled for this authorized origin; the browser adapter must still verify a documented provider test key.',
        origin
      };
    }
    return {
      decision: 'human-handoff',
      reason: origin !== null && this.#authorizedOrigins.has(origin)
        ? 'This challenge type requires a person in the existing browser session.'
        : 'The origin is not authorized for local automated handling.',
      origin
    };
  }
}
