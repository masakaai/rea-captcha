import type {
  ChallengeEvidence,
  ChallengeFinding,
  ChallengeKind,
  ChallengeObservation
} from '../domain/challenge.js';

interface Rule {
  readonly kind: ChallengeKind;
  readonly source: ChallengeEvidence['source'];
  readonly signal: string;
  readonly pattern: RegExp;
  readonly confidence: number;
}

const rules: readonly Rule[] = [
  { kind: 'recaptcha', source: 'iframe', signal: 'recaptcha-frame', pattern: /(?:google\.com|recaptcha\.net)\/recaptcha|g-recaptcha/i, confidence: 0.99 },
  { kind: 'recaptcha', source: 'text', signal: 'recaptcha-copy', pattern: /(?:\bi(?:'m| am) not a robot\b[\s\S]{0,120}\brecaptcha\b|\brecaptcha\b[\s\S]{0,120}\bi(?:'m| am) not a robot\b)/i, confidence: 0.9 },
  { kind: 'hcaptcha', source: 'iframe', signal: 'hcaptcha-frame', pattern: /hcaptcha\.com|h-captcha/i, confidence: 0.99 },
  { kind: 'turnstile', source: 'iframe', signal: 'turnstile-frame', pattern: /challenges\.cloudflare\.com|cf-turnstile|turnstile/i, confidence: 0.98 },
  { kind: 'geetest', source: 'script', signal: 'geetest-widget', pattern: /geetest|gt-captcha|geetest_challenge/i, confidence: 0.97 },
  { kind: 'datadome', source: 'script', signal: 'datadome-widget', pattern: /datadome|captcha-delivery\.com/i, confidence: 0.97 },
  { kind: 'perimeterx', source: 'script', signal: 'perimeterx-widget', pattern: /perimeterx|px-captcha|human-challenge/i, confidence: 0.96 },
  { kind: 'aws-waf', source: 'script', signal: 'aws-waf-widget', pattern: /awswafcaptcha|aws-waf-token|captcha\.awswaf/i, confidence: 0.96 },
  { kind: 'image-text', source: 'dom', signal: 'captcha-input', pattern: /(?:name|id|class)=["'][^"']*(?:captcha|verification[-_ ]?code)[^"']*["']/i, confidence: 0.82 },
  { kind: 'generic-verification', source: 'text', signal: 'verification-copy', pattern: /verify (?:that )?you(?:'re| are) human|security check|complete the verification|请完成验证|验证(?:码|您是人类)|安全验证/i, confidence: 0.68 }
];

const passedPattern = /captcha[-_ ]?(?:success|solved|verified)|verification[-_ ]?(?:success|complete)|data-captcha-status=["']passed["']/i;
const failedPattern = /captcha[-_ ]?(?:failed|error)|verification[-_ ]?failed|data-captcha-status=["']failed["']/i;

const clamp = (value: number): number => Math.max(0, Math.min(1, value));

export class DomChallengeDetector {
  detect(observation: ChallengeObservation): ChallengeFinding {
    const inspectedAt = new Date().toISOString();
    const documentEvidence = `${observation.html ?? ''}\n${observation.text ?? ''}\n${observation.runtimeSignals?.join('\n') ?? ''}`;

    const evidence: ChallengeEvidence[] = [];
    let selected: Rule | null = null;
    for (const rule of rules) {
      const match = documentEvidence.match(rule.pattern);
      if (!match) continue;
      evidence.push({ source: rule.source, signal: rule.signal, value: match[0].slice(0, 240), confidence: rule.confidence });
      if (selected === null || rule.confidence > selected.confidence) selected = rule;
    }

    if (selected !== null) {
      const corroboration = Math.min(0.05, Math.max(0, evidence.length - 1) * 0.02);
      return {
        status: failedPattern.test(documentEvidence) ? 'failed' : 'detected',
        kind: selected.kind,
        confidence: clamp(selected.confidence + corroboration),
        url: observation.url,
        title: observation.title,
        evidence,
        inspectedAt
      };
    }

    if (passedPattern.test(documentEvidence)) {
      return {
        status: 'passed', kind: null, confidence: 0.92, url: observation.url, title: observation.title,
        evidence: [{ source: 'runtime', signal: 'verified-marker', value: 'A verification success marker is present.', confidence: 0.92 }],
        inspectedAt
      };
    }

    return { status: 'clear', kind: null, confidence: 0.95, url: observation.url, title: observation.title, evidence: [], inspectedAt };
  }
}
