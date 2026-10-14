import { describe, expect, it } from 'vitest';
import { DomChallengeDetector } from '../src/detector/dom-detector.js';
import { ChallengePolicy } from '../src/application/policy.js';

const detector = new DomChallengeDetector();
const observation = (html: string, url = 'https://fixture.test/checkout') => ({
  url,
  title: 'Fixture',
  html,
  capturedAt: new Date().toISOString()
});

describe('DOM challenge detector', () => {
  it.each([
    ['recaptcha', '<div class="g-recaptcha"></div>'],
    ['hcaptcha', '<iframe src="https://newassets.hcaptcha.com/captcha/v1"></iframe>'],
    ['turnstile', '<div class="cf-turnstile"></div>'],
    ['geetest', '<script src="/geetest/bootstrap.js"></script>'],
    ['datadome', '<script src="https://captcha-delivery.com/captcha.js"></script>'],
    ['perimeterx', '<div id="px-captcha"></div>'],
    ['aws-waf', '<input name="aws-waf-token">'],
    ['image-text', '<input name="captcha_code">']
  ])('detects %s from deterministic fixture evidence', (kind, html) => {
    const finding = detector.detect(observation(html));
    expect(finding.status).toBe('detected');
    expect(finding.kind).toBe(kind);
    expect(finding.evidence.length).toBeGreaterThan(0);
  });

  it('does not flag ordinary documentation that only mentions robots', () => {
    const finding = detector.detect(observation('<main>Robotics and browser testing documentation</main>'));
    expect(finding.status).toBe('clear');
    expect(finding.kind).toBeNull();
  });

  it('treats an explicit completion marker as passed', () => {
    const finding = detector.detect(observation('<div data-captcha-status="passed">Complete</div>'));
    expect(finding.status).toBe('passed');
  });

  it('fails closed when a stale success marker and an active widget coexist', () => {
    const finding = detector.detect(observation('<main data-captcha-status="passed"><div class="cf-turnstile"></div></main>'));
    expect(finding.status).toBe('detected');
    expect(finding.kind).toBe('turnstile');
  });
});

describe('challenge policy', () => {
  it('requires a person for third-party challenges', () => {
    const finding = detector.detect(observation('<div class="cf-turnstile"></div>', 'https://third-party.test/'));
    expect(new ChallengePolicy().decide(finding).decision).toBe('human-handoff');
  });

  it('allows local image recognition only for an authorized origin', () => {
    const policy = new ChallengePolicy({ authorizedOrigins: ['https://fixture.test'], allowLocalImageText: true });
    const allowed = detector.detect(observation('<input name="captcha_code">'));
    const denied = detector.detect(observation('<input name="captcha_code">', 'https://elsewhere.test/'));
    expect(policy.decide(allowed).decision).toBe('local-processing');
    expect(policy.decide(denied).decision).toBe('human-handoff');
  });
});
