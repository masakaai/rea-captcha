import type { ChallengeInspection, ChallengeObservation } from '../domain/challenge.js';
import type { ChallengeState } from '../domain/state-machine.js';

export interface BrowserChallengePort {
  readonly id: string;
  observe(signal?: AbortSignal): Promise<ChallengeObservation>;
}

export interface BrowserChallengeActionPort extends BrowserChallengePort {
  completeAuthorizedChallenge(inspection: ChallengeInspection, signal?: AbortSignal): Promise<void>;
}

export const supportsAuthorizedChallengeAction = (
  browser: BrowserChallengePort
): browser is BrowserChallengeActionPort =>
  'completeAuthorizedChallenge' in browser && typeof browser.completeAuthorizedChallenge === 'function';

export interface AgentLifecyclePort {
  pause(reason: ChallengeInspection): Promise<void> | void;
  resume(reason: ChallengeInspection): Promise<void> | void;
}

export interface ChallengeEvent {
  readonly sessionId: string;
  readonly type: 'state' | 'inspection' | 'agent-action' | 'handoff' | 'resume' | 'timeout' | 'error';
  readonly state: ChallengeState;
  readonly timestamp: string;
  readonly data?: Readonly<Record<string, unknown>>;
}

export interface ChallengeEventSink {
  write(event: ChallengeEvent): Promise<void> | void;
}

export interface Clock {
  now(): Date;
  sleep(milliseconds: number, signal?: AbortSignal): Promise<void>;
}
