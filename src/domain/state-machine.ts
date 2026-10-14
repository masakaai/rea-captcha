import { err, ok, type Result } from './result.js';

export const challengeStates = [
  'idle',
  'inspecting',
  'clear',
  'blocked',
  'acting',
  'awaiting-human',
  'verifying',
  'resumed',
  'timed-out',
  'failed',
  'closed'
] as const;

export type ChallengeState = (typeof challengeStates)[number];

const transitions: Readonly<Record<ChallengeState, readonly ChallengeState[]>> = {
  idle: ['inspecting', 'closed'],
  inspecting: ['clear', 'blocked', 'failed', 'closed'],
  clear: ['inspecting', 'verifying', 'resumed', 'failed', 'closed'],
  blocked: ['inspecting', 'acting', 'awaiting-human', 'verifying', 'failed', 'closed'],
  acting: ['verifying', 'failed', 'closed'],
  'awaiting-human': ['inspecting', 'verifying', 'timed-out', 'failed', 'closed'],
  verifying: ['inspecting', 'clear', 'blocked', 'resumed', 'timed-out', 'failed', 'closed'],
  resumed: ['inspecting', 'closed'],
  'timed-out': ['inspecting', 'awaiting-human', 'verifying', 'closed'],
  failed: ['inspecting', 'closed'],
  closed: []
};

export interface StateTransitionError {
  readonly code: 'invalid-state-transition';
  readonly from: ChallengeState;
  readonly to: ChallengeState;
}

export class ChallengeStateMachine {
  #state: ChallengeState = 'idle';

  get state(): ChallengeState {
    return this.#state;
  }

  transition(to: ChallengeState): Result<ChallengeState, StateTransitionError> {
    if (!transitions[this.#state].includes(to)) {
      return err({ code: 'invalid-state-transition', from: this.#state, to });
    }
    this.#state = to;
    return ok(to);
  }
}
