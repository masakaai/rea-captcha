import type { ChallengeInspection } from '../domain/challenge.js';
import { ChallengeStateMachine, type ChallengeState } from '../domain/state-machine.js';
import { DomChallengeDetector } from '../detector/dom-detector.js';
import { supportsAuthorizedChallengeAction, type AgentLifecyclePort, type BrowserChallengePort, type ChallengeEventSink, type Clock } from './ports.js';
import { ChallengePolicy } from './policy.js';

const systemClock: Clock = {
  now: () => new Date(),
  sleep: (milliseconds, signal) => new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason ?? new Error('Aborted'));
    const timer = setTimeout(done, milliseconds);
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
  })
};

const noopLifecycle: AgentLifecyclePort = { pause() {}, resume() {} };
const noopSink: ChallengeEventSink = { write() {} };

export interface ChallengeControllerOptions {
  readonly browser: BrowserChallengePort;
  readonly detector?: DomChallengeDetector;
  readonly policy?: ChallengePolicy;
  readonly lifecycle?: AgentLifecyclePort;
  readonly events?: ChallengeEventSink;
  readonly clock?: Clock;
}

export class ChallengeController {
  readonly #browser: BrowserChallengePort;
  readonly #detector: DomChallengeDetector;
  readonly #policy: ChallengePolicy;
  readonly #lifecycle: AgentLifecyclePort;
  readonly #events: ChallengeEventSink;
  readonly #clock: Clock;
  readonly #machine = new ChallengeStateMachine();
  #lastInspection: ChallengeInspection | null = null;

  constructor(options: ChallengeControllerOptions) {
    this.#browser = options.browser;
    this.#detector = options.detector ?? new DomChallengeDetector();
    this.#policy = options.policy ?? new ChallengePolicy();
    this.#lifecycle = options.lifecycle ?? noopLifecycle;
    this.#events = options.events ?? noopSink;
    this.#clock = options.clock ?? systemClock;
  }

  get id(): string { return this.#browser.id; }
  get state(): ChallengeState { return this.#machine.state; }
  get lastInspection(): ChallengeInspection | null { return this.#lastInspection; }

  async inspect(signal?: AbortSignal): Promise<ChallengeInspection> {
    this.#move('inspecting');
    try {
      const observation = await this.#browser.observe(signal);
      const finding = this.#detector.detect(observation);
      const inspection = { finding, policy: this.#policy.decide(finding) } satisfies ChallengeInspection;
      this.#lastInspection = inspection;
      this.#move(inspection.policy.decision === 'continue' ? 'clear' : 'blocked');
      await this.#emit('inspection', {
        status: finding.status,
        kind: finding.kind,
        confidence: finding.confidence,
        decision: inspection.policy.decision,
        evidenceCount: finding.evidence.length
      });
      return inspection;
    } catch (error) {
      this.#move('failed');
      await this.#emit('error', { message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async handoff(): Promise<ChallengeInspection> {
    const inspection = this.#requireInspection();
    if (inspection.policy.decision === 'continue') throw new Error('No active challenge requires handoff.');
    this.#move('awaiting-human');
    try { await this.#lifecycle.pause(inspection); }
    catch (error) {
      this.#move('failed');
      await this.#emit('error', { message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
    await this.#emit('handoff', { kind: inspection.finding.kind, url: inspection.finding.url });
    return inspection;
  }

  async complete({ timeoutMs = 30_000, pollMs = 100, signal }: { timeoutMs?: number; pollMs?: number; signal?: AbortSignal } = {}): Promise<ChallengeInspection> {
    this.#validateWaitOptions(timeoutMs, pollMs);
    const inspection = this.#requireInspection();
    if (inspection.policy.decision !== 'agent-action' && inspection.policy.decision !== 'local-processing') {
      throw new Error('The active challenge is not authorized for agent completion.');
    }
    if (!supportsAuthorizedChallengeAction(this.#browser)) {
      throw new Error('The configured browser adapter does not support authorized challenge actions.');
    }
    this.#move('acting');
    try {
      await this.#browser.completeAuthorizedChallenge(inspection, signal);
      await this.#emit('agent-action', { kind: inspection.finding.kind, url: inspection.finding.url });
    } catch (error) {
      this.#move('failed');
      await this.#emit('error', { message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
    return this.wait({ timeoutMs, pollMs, ...(signal ? { signal } : {}) });
  }

  async wait({ timeoutMs = 120_000, pollMs = 1_000, signal }: { timeoutMs?: number; pollMs?: number; signal?: AbortSignal } = {}): Promise<ChallengeInspection> {
    this.#validateWaitOptions(timeoutMs, pollMs);
    const deadline = this.#clock.now().getTime() + timeoutMs;
    while (this.#clock.now().getTime() < deadline) {
      this.#move('verifying');
      const inspection = await this.inspect(signal);
      if (inspection.policy.decision === 'continue') return inspection;
      this.#move('awaiting-human');
      await this.#clock.sleep(Math.min(pollMs, Math.max(1, deadline - this.#clock.now().getTime())), signal);
    }
    this.#move('timed-out');
    await this.#emit('timeout', { timeoutMs });
    throw new Error(`Verification challenge did not clear within ${timeoutMs} ms.`);
  }

  async resume(signal?: AbortSignal): Promise<ChallengeInspection> {
    this.#move('verifying');
    const inspection = await this.inspect(signal);
    if (inspection.policy.decision !== 'continue') {
      throw new Error('Verification challenge is still active; the agent was not resumed.');
    }
    try { await this.#lifecycle.resume(inspection); }
    catch (error) {
      this.#move('failed');
      await this.#emit('error', { message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
    this.#move('resumed');
    await this.#emit('resume', { url: inspection.finding.url });
    return inspection;
  }

  close(): void {
    if (this.state !== 'closed') this.#move('closed');
  }

  #requireInspection(): ChallengeInspection {
    if (this.#lastInspection === null) throw new Error('Inspect the browser before requesting handoff.');
    return this.#lastInspection;
  }

  #validateWaitOptions(timeoutMs: number, pollMs: number): void {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 3_600_000) throw new Error('timeoutMs must be an integer from 1 to 3600000.');
    if (!Number.isInteger(pollMs) || pollMs < 25 || pollMs > 60_000) throw new Error('pollMs must be an integer from 25 to 60000.');
  }

  #move(state: ChallengeState): void {
    const result = this.#machine.transition(state);
    if (!result.ok) throw new Error(`Invalid challenge state transition: ${result.error.from} -> ${result.error.to}`);
    void this.#emit('state', { state }).catch(() => {});
  }

  async #emit(type: Parameters<ChallengeEventSink['write']>[0]['type'], data?: Readonly<Record<string, unknown>>): Promise<void> {
    await this.#events.write({
      sessionId: this.id,
      type,
      state: this.state,
      timestamp: this.#clock.now().toISOString(),
      ...(data ? { data } : {})
    });
  }
}
