import type { BrowserChallengePort } from '../application/ports.js';
import type { ChallengeObservation } from '../domain/challenge.js';
import { browserObservationExpression } from '../detector/browser-expression.js';
import { parseObservation } from './observation.js';

export interface PlaywrightPagePort {
  evaluate<R>(expression: string): Promise<R>;
}

export class PlaywrightChallengeAdapter implements BrowserChallengePort {
  readonly id: string;
  readonly #page: PlaywrightPagePort;

  constructor({ id, page }: { id: string; page: PlaywrightPagePort }) {
    if (!id) throw new Error('Playwright adapter id is required.');
    this.id = id;
    this.#page = page;
  }

  async observe(signal?: AbortSignal): Promise<ChallengeObservation> {
    if (signal?.aborted) throw signal.reason ?? new Error('Aborted');
    const evaluation = this.#page.evaluate<unknown>(browserObservationExpression);
    const value = signal ? await Promise.race([
      evaluation,
      new Promise<never>((_resolve, reject) => {
        const abort = () => reject(signal.reason ?? new Error('Aborted'));
        signal.addEventListener('abort', abort, { once: true });
        void evaluation.finally(() => signal.removeEventListener('abort', abort));
      })
    ]) : await evaluation;
    return parseObservation(value);
  }
}
