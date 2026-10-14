import type { ChallengeFinding, ChallengePolicyDecision } from '../domain/challenge.js';

export interface ChallengePolicyOptions {
  readonly authorizedOrigins?: readonly string[];
  readonly allowLocalImageText?: boolean;
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

  constructor(options: ChallengePolicyOptions = {}) {
    this.#authorizedOrigins = new Set((options.authorizedOrigins ?? []).map(normalizeOrigin).filter((value): value is string => Boolean(value)));
    this.#allowLocalImageText = options.allowLocalImageText ?? false;
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
    return {
      decision: 'human-handoff',
      reason: origin !== null && this.#authorizedOrigins.has(origin)
        ? 'This challenge type requires a person in the existing browser session.'
        : 'The origin is not authorized for local automated handling.',
      origin
    };
  }
}
