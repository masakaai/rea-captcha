export const challengeKinds = [
  'recaptcha',
  'hcaptcha',
  'turnstile',
  'geetest',
  'datadome',
  'perimeterx',
  'aws-waf',
  'image-text',
  'generic-verification',
  'unknown'
] as const;

export type ChallengeKind = (typeof challengeKinds)[number];
export type ChallengeStatus = 'clear' | 'detected' | 'passed' | 'failed' | 'unknown';
export type EvidenceSource = 'dom' | 'iframe' | 'script' | 'text' | 'runtime';

export interface ChallengeEvidence {
  readonly source: EvidenceSource;
  readonly signal: string;
  readonly value: string;
  readonly confidence: number;
}

export interface ChallengeObservation {
  readonly url: string;
  readonly title: string;
  readonly html?: string;
  readonly text?: string;
  readonly runtimeSignals?: readonly string[];
  readonly capturedAt: string;
}

export interface ChallengeFinding {
  readonly status: ChallengeStatus;
  readonly kind: ChallengeKind | null;
  readonly confidence: number;
  readonly url: string;
  readonly title: string;
  readonly evidence: readonly ChallengeEvidence[];
  readonly inspectedAt: string;
}

export type ChallengeDecision = 'continue' | 'human-handoff' | 'local-processing';

export interface ChallengePolicyDecision {
  readonly decision: ChallengeDecision;
  readonly reason: string;
  readonly origin: string | null;
}

export interface ChallengeInspection {
  readonly finding: ChallengeFinding;
  readonly policy: ChallengePolicyDecision;
}
