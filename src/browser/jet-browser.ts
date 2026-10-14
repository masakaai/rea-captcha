import type { BrowserChallengePort } from '../application/ports.js';
import type { ChallengeObservation } from '../domain/challenge.js';
import { browserObservationExpression } from '../detector/browser-expression.js';
import { parseObservation } from './observation.js';

export interface JetBrowserClientPort {
  evaluate(sessionId: string, expression: string, options?: { signal?: AbortSignal }): Promise<unknown>;
  snapshot?(sessionId: string, options?: { signal?: AbortSignal }): Promise<unknown>;
}

const unwrapEvaluation = (value: unknown): unknown => {
  if (!value || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  return 'evaluation' in record ? record.evaluation : value;
};

export class JetBrowserChallengeAdapter implements BrowserChallengePort {
  readonly id: string;
  readonly #client: JetBrowserClientPort;
  readonly #sessionId: string;

  constructor({ id, client, sessionId }: { id?: string; client: JetBrowserClientPort; sessionId: string }) {
    if (!sessionId) throw new Error('Jet Browser sessionId is required.');
    this.id = id ?? sessionId;
    this.#client = client;
    this.#sessionId = sessionId;
  }

  async observe(signal?: AbortSignal): Promise<ChallengeObservation> {
    if (signal?.aborted) throw signal.reason ?? new Error('Aborted');
    const value = await this.#client.evaluate(
      this.#sessionId,
      browserObservationExpression,
      signal ? { signal } : undefined
    );
    return parseObservation(unwrapEvaluation(value));
  }
}
