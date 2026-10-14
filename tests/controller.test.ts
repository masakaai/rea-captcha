import { describe, expect, it, vi } from 'vitest';
import { ChallengeController } from '../src/application/controller.js';
import { InlineChallengeAdapter } from '../src/browser/inline.js';
import { MemoryChallengeEventSink } from '../src/application/jsonl-event-sink.js';
import { ChallengePolicy } from '../src/application/policy.js';

describe('ChallengeController', () => {
  it('owns the detect -> handoff -> verify -> resume sequence', async () => {
    const browser = new InlineChallengeAdapter('fixture', {
      url: 'https://fixture.test/', title: 'Fixture', html: '<div class="cf-turnstile"></div>'
    });
    const pause = vi.fn();
    const resume = vi.fn();
    const events = new MemoryChallengeEventSink();
    const controller = new ChallengeController({ browser, lifecycle: { pause, resume }, events });

    const detected = await controller.inspect();
    expect(detected.finding.kind).toBe('turnstile');
    expect(controller.state).toBe('blocked');
    await controller.handoff();
    expect(controller.state).toBe('awaiting-human');
    expect(pause).toHaveBeenCalledOnce();

    browser.update({ url: 'https://fixture.test/', title: 'Fixture', html: '<main>Ready</main>' });
    const clear = await controller.wait({ timeoutMs: 100, pollMs: 25 });
    expect(clear.finding.status).toBe('clear');
    await controller.resume();
    expect(controller.state).toBe('resumed');
    expect(resume).toHaveBeenCalledOnce();
    expect(events.events.some(event => event.type === 'handoff')).toBe(true);
    expect(events.events.some(event => event.type === 'resume')).toBe(true);
  });

  it('does not resume while challenge evidence remains', async () => {
    const browser = new InlineChallengeAdapter('fixture', {
      url: 'https://fixture.test/', title: 'Fixture', html: '<div class="g-recaptcha"></div>'
    });
    const controller = new ChallengeController({ browser });
    await controller.inspect();
    await expect(controller.resume()).rejects.toThrow('still active');
    expect(controller.state).toBe('blocked');
  });

  it('lets an authorized agent action complete before fresh verification and resume', async () => {
    const inline = new InlineChallengeAdapter('agent-fixture', {
      url: 'https://fixture.test/', title: 'Fixture', html: '<div class="cf-turnstile"></div>'
    });
    const completeAuthorizedChallenge = vi.fn(async () => {
      inline.update({
        url: 'https://fixture.test/passed',
        title: 'Fixture passed',
        html: '<main data-captcha-status="passed">Validated</main>'
      });
    });
    const browser = Object.assign(inline, { completeAuthorizedChallenge });
    const resume = vi.fn();
    const events = new MemoryChallengeEventSink();
    const controller = new ChallengeController({
      browser,
      policy: new ChallengePolicy({
        authorizedOrigins: ['https://fixture.test'],
        allowProviderTestAutomation: true
      }),
      lifecycle: { pause() {}, resume },
      events
    });

    const detected = await controller.inspect();
    expect(detected.policy.decision).toBe('agent-action');
    const cleared = await controller.complete({ timeoutMs: 100, pollMs: 25 });
    expect(cleared.finding.status).toBe('passed');
    expect(completeAuthorizedChallenge).toHaveBeenCalledOnce();
    await controller.resume();
    expect(resume).toHaveBeenCalledOnce();
    expect(events.events.some(event => event.type === 'agent-action')).toBe(true);
  });

  it('validates completion timing before performing an authorized browser action', async () => {
    const inline = new InlineChallengeAdapter('agent-fixture', {
      url: 'https://fixture.test/', title: 'Fixture', html: '<div class="cf-turnstile"></div>'
    });
    const completeAuthorizedChallenge = vi.fn(async () => {});
    const controller = new ChallengeController({
      browser: Object.assign(inline, { completeAuthorizedChallenge }),
      policy: new ChallengePolicy({
        authorizedOrigins: ['https://fixture.test'],
        allowProviderTestAutomation: true
      })
    });
    await controller.inspect();

    await expect(controller.complete({ timeoutMs: 0 })).rejects.toThrow('timeoutMs');
    expect(completeAuthorizedChallenge).not.toHaveBeenCalled();
    expect(controller.state).toBe('blocked');
  });

  it('fails closed when the lifecycle cannot pause or resume', async () => {
    const challenged = new InlineChallengeAdapter('pause-failure', {
      url: 'https://fixture.test/', title: 'Fixture', html: '<div class="g-recaptcha"></div>'
    });
    const pauseController = new ChallengeController({
      browser: challenged,
      lifecycle: { pause: () => { throw new Error('pause failed'); }, resume() {} }
    });
    await pauseController.inspect();
    await expect(pauseController.handoff()).rejects.toThrow('pause failed');
    expect(pauseController.state).toBe('failed');

    const cleared = new InlineChallengeAdapter('resume-failure', {
      url: 'https://fixture.test/', title: 'Fixture', html: '<main>Ready</main>'
    });
    const resumeController = new ChallengeController({
      browser: cleared,
      lifecycle: { pause() {}, resume: () => { throw new Error('resume failed'); } }
    });
    await resumeController.inspect();
    await expect(resumeController.resume()).rejects.toThrow('resume failed');
    expect(resumeController.state).toBe('failed');
  });

  it('times out with bounded polling', async () => {
    const browser = new InlineChallengeAdapter('fixture', {
      url: 'https://fixture.test/', title: 'Fixture', html: '<div class="h-captcha"></div>'
    });
    const controller = new ChallengeController({ browser });
    await controller.inspect();
    await controller.handoff();
    await expect(controller.wait({ timeoutMs: 30, pollMs: 25 })).rejects.toThrow('did not clear');
    expect(controller.state).toBe('timed-out');

    browser.update({ url: 'https://fixture.test/', title: 'Fixture', html: '<main>Completed late</main>' });
    await expect(controller.resume()).resolves.toMatchObject({ finding: { status: 'clear' } });
    expect(controller.state).toBe('resumed');
  });
});
