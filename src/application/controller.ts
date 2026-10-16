import { randomUUID } from 'node:crypto';
import type { ChallengeHandoff, ChallengeHandoffIdentity, ChallengeInspection } from '../domain/challenge.js';
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

export interface ChallengeHandoffOptions {
  readonly taskId: string;
}

export interface ChallengeResumeOptions {
  readonly taskId: string;
  readonly handoffId: string;
  readonly signal?: AbortSignal;
}

type ResumePermit =
  | { readonly kind: 'handoff'; readonly key: string; readonly identity: ChallengeHandoffIdentity }
  | { readonly kind: 'agent-action'; readonly key: string };

export class ChallengeController {
  readonly #browser: BrowserChallengePort;
  readonly #detector: DomChallengeDetector;
  readonly #policy: ChallengePolicy;
  readonly #lifecycle: AgentLifecyclePort;
  readonly #events: ChallengeEventSink;
  readonly #clock: Clock;
  readonly #machine = new ChallengeStateMachine();
  #lastInspection: ChallengeInspection | null = null;
  #handoffGeneration = 0;
  #activeHandoff: ChallengeHandoffIdentity | null = null;
  #authorizedResumeKey: string | null = null;
  #resumeInFlight: { readonly permit: ResumePermit; readonly promise: Promise<ChallengeInspection> } | null = null;
  readonly #staleHandoffIds = new Set<string>();
  readonly #consumedHandoffIds = new Set<string>();

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
    this.#assertNoResumeInFlight();
    return this.#inspect(signal);
  }

  async #inspect(signal?: AbortSignal): Promise<ChallengeInspection> {
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

  async handoff({ taskId }: ChallengeHandoffOptions): Promise<ChallengeHandoff> {
    this.#assertNoResumeInFlight();
    this.#validateScopeValue('taskId', taskId);
    const inspection = this.#requireInspection();
    if (inspection.policy.decision === 'continue') throw new Error('No active challenge requires handoff.');
    this.#move('awaiting-human');
    try { await this.#lifecycle.pause(inspection); }
    catch (error) {
      this.#move('failed');
      await this.#emit('error', { message: error instanceof Error ? error.message : String(error) });
      throw error;
    }
    const generation = this.#handoffGeneration + 1;
    const identity: ChallengeHandoffIdentity = {
      id: randomUUID(),
      taskId,
      tabId: this.id,
      generation
    };
    if (this.#activeHandoff !== null) this.#remember(this.#staleHandoffIds, this.#activeHandoff.id);
    this.#handoffGeneration = generation;
    this.#activeHandoff = identity;
    this.#authorizedResumeKey = null;
    await this.#emit('handoff', {
      kind: inspection.finding.kind,
      url: inspection.finding.url,
      generation
    });
    return { ...inspection, handoff: identity };
  }

  async complete({ timeoutMs = 30_000, pollMs = 100, signal }: { timeoutMs?: number; pollMs?: number; signal?: AbortSignal } = {}): Promise<ChallengeInspection> {
    this.#assertNoResumeInFlight();
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
    const cleared = await this.wait({ timeoutMs, pollMs, ...(signal ? { signal } : {}) });
    this.#authorizedResumeKey = `agent-action:${randomUUID()}`;
    return cleared;
  }

  async wait({ timeoutMs = 120_000, pollMs = 1_000, signal }: { timeoutMs?: number; pollMs?: number; signal?: AbortSignal } = {}): Promise<ChallengeInspection> {
    this.#assertNoResumeInFlight();
    this.#validateWaitOptions(timeoutMs, pollMs);
    const deadline = this.#clock.now().getTime() + timeoutMs;
    while (this.#clock.now().getTime() < deadline) {
      this.#move('verifying');
      const inspection = await this.#inspect(signal);
      if (inspection.policy.decision === 'continue') return inspection;
      this.#move('awaiting-human');
      await this.#clock.sleep(Math.min(pollMs, Math.max(1, deadline - this.#clock.now().getTime())), signal);
    }
    this.#move('timed-out');
    await this.#emit('timeout', { timeoutMs });
    throw new Error(`Verification challenge did not clear within ${timeoutMs} ms.`);
  }

  resume(options: ChallengeResumeOptions): Promise<ChallengeInspection>;
  resume(signal?: AbortSignal): Promise<ChallengeInspection>;
  resume(input?: AbortSignal | ChallengeResumeOptions): Promise<ChallengeInspection> {
    if (this.#resumeInFlight !== null) {
      if (this.#matchesInFlightResume(input, this.#resumeInFlight.permit)) {
        return this.#resumeInFlight.promise;
      }
      return Promise.reject(new Error('Another resume operation is already in progress.'));
    }
    let permit: ResumePermit;
    try { permit = this.#resolveResumePermit(input); }
    catch (error) { return Promise.reject(error); }
    const signal = input && 'handoffId' in input ? input.signal : input;
    const pending = this.#resume(permit, signal);
    this.#resumeInFlight = { permit, promise: pending };
    void pending.finally(() => {
      if (this.#resumeInFlight?.promise === pending) this.#resumeInFlight = null;
    }).catch(() => {});
    return pending;
  }

  async #resume(permit: ResumePermit, signal?: AbortSignal): Promise<ChallengeInspection> {
    this.#move('verifying');
    const inspection = await this.#inspect(signal);
    if (inspection.policy.decision !== 'continue') {
      throw new Error('Verification challenge is still active; the agent was not resumed.');
    }
    this.#consumeResumePermit(permit);
    try { await this.#lifecycle.resume(inspection); }
    catch (error) {
      if (this.state !== 'closed') {
        this.#move('failed');
        await this.#emit('error', { message: error instanceof Error ? error.message : String(error) });
      }
      throw error;
    }
    if (this.state === 'closed') {
      throw new Error('The controller was closed while the agent lifecycle was resuming.');
    }
    this.#move('resumed');
    await this.#emit('resume', {
      url: inspection.finding.url,
      ...(permit.kind === 'handoff' ? { generation: permit.identity.generation } : {})
    });
    return inspection;
  }

  close(): void {
    if (this.state === 'closed') return;
    if (this.#activeHandoff !== null) {
      this.#remember(this.#staleHandoffIds, this.#activeHandoff.id);
      this.#activeHandoff = null;
    }
    this.#authorizedResumeKey = null;
    this.#move('closed');
  }

  #requireInspection(): ChallengeInspection {
    if (this.#lastInspection === null) throw new Error('Inspect the browser before requesting handoff.');
    return this.#lastInspection;
  }

  #validateWaitOptions(timeoutMs: number, pollMs: number): void {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 3_600_000) throw new Error('timeoutMs must be an integer from 1 to 3600000.');
    if (!Number.isInteger(pollMs) || pollMs < 25 || pollMs > 60_000) throw new Error('pollMs must be an integer from 25 to 60000.');
  }

  #resolveResumePermit(input?: AbortSignal | ChallengeResumeOptions): ResumePermit {
    if (input && 'handoffId' in input) {
      this.#validateScopeValue('taskId', input.taskId);
      this.#validateScopeValue('handoffId', input.handoffId);
      if (this.#consumedHandoffIds.has(input.handoffId)) {
        throw new Error('This handoff completion was already consumed.');
      }
      if (this.#staleHandoffIds.has(input.handoffId)) {
        throw new Error('This handoff completion is stale.');
      }
      const active = this.#activeHandoff;
      if (active === null || active.id !== input.handoffId) {
        throw new Error('This handoff completion is unknown or stale.');
      }
      if (active.taskId !== input.taskId) throw new Error('The handoff task does not match the active task.');
      if (active.tabId !== this.id) throw new Error('The handoff tab does not match the active browser tab.');
      return { kind: 'handoff', key: `handoff:${active.id}`, identity: active };
    }
    if (this.#activeHandoff !== null) {
      throw new Error('handoffId and taskId are required to resume an active human handoff.');
    }
    if (this.#authorizedResumeKey === null) {
      throw new Error('No completed handoff or authorized agent action is ready to resume.');
    }
    return { kind: 'agent-action', key: this.#authorizedResumeKey };
  }

  #assertPermitCurrent(permit: ResumePermit): void {
    if (permit.kind === 'handoff') {
      const active = this.#activeHandoff;
      if (active === null || active.id !== permit.identity.id || active.generation !== permit.identity.generation) {
        throw new Error('This handoff completion became stale before the agent could resume.');
      }
      if (active.taskId !== permit.identity.taskId || active.tabId !== permit.identity.tabId) {
        throw new Error('The handoff scope changed before the agent could resume.');
      }
    } else if (this.#authorizedResumeKey !== permit.key) {
      throw new Error('The authorized agent-action completion became stale before resume.');
    }
  }

  #consumeResumePermit(permit: ResumePermit): void {
    this.#assertPermitCurrent(permit);
    if (permit.kind === 'handoff') {
      this.#activeHandoff = null;
      this.#remember(this.#consumedHandoffIds, permit.identity.id);
    } else {
      this.#authorizedResumeKey = null;
    }
  }

  #matchesInFlightResume(input: AbortSignal | ChallengeResumeOptions | undefined, permit: ResumePermit): boolean {
    if (input && 'handoffId' in input) {
      return permit.kind === 'handoff'
        && input.handoffId === permit.identity.id
        && input.taskId === permit.identity.taskId;
    }
    return permit.kind === 'agent-action';
  }

  #assertNoResumeInFlight(): void {
    if (this.#resumeInFlight !== null) throw new Error('A resume operation is already in progress.');
  }

  #validateScopeValue(name: string, value: string): void {
    if (typeof value !== 'string' || value.trim().length < 1 || value.length > 200) {
      throw new Error(`${name} must be a non-empty string of at most 200 characters.`);
    }
  }

  #remember(values: Set<string>, value: string): void {
    values.add(value);
    if (values.size > 64) values.delete(values.values().next().value as string);
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
