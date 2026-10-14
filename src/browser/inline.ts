import type { BrowserChallengePort } from '../application/ports.js';
import type { ChallengeObservation } from '../domain/challenge.js';

export class InlineChallengeAdapter implements BrowserChallengePort {
  readonly id: string;
  #observation: ChallengeObservation;

  constructor(id: string, observation: Omit<ChallengeObservation, 'capturedAt'> & { capturedAt?: string }) {
    if (!id) throw new Error('Inline adapter id is required.');
    this.id = id;
    this.#observation = { ...observation, capturedAt: observation.capturedAt ?? new Date().toISOString() };
  }

  update(observation: Omit<ChallengeObservation, 'capturedAt'> & { capturedAt?: string }): void {
    this.#observation = { ...observation, capturedAt: observation.capturedAt ?? new Date().toISOString() };
  }

  async observe(signal?: AbortSignal): Promise<ChallengeObservation> {
    if (signal?.aborted) throw signal.reason ?? new Error('Aborted');
    return this.#observation;
  }
}
