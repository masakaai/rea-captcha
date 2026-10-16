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
    const handoff = await controller.handoff({ taskId: 'fixture-task' });
    expect(controller.state).toBe('awaiting-human');
    expect(pause).toHaveBeenCalledOnce();

    browser.update({ url: 'https://fixture.test/', title: 'Fixture', html: '<main>Ready</main>' });
    const clear = await controller.wait({ timeoutMs: 100, pollMs: 25 });
    expect(clear.finding.status).toBe('clear');
    await controller.resume({ taskId: 'fixture-task', handoffId: handoff.handoff.id });
    expect(controller.state).toBe('resumed');
    expect(resume).toHaveBeenCalledOnce();
    const handoffEvent = events.events.find(event => event.type === 'handoff');
    const resumeEvent = events.events.find(event => event.type === 'resume');
    expect(handoffEvent?.data).toMatchObject({ generation: 1 });
    expect(resumeEvent?.data).toMatchObject({ generation: 1 });
    expect(JSON.stringify([handoffEvent, resumeEvent])).not.toContain(handoff.handoff.id);
  });

  it('does not resume while challenge evidence remains', async () => {
    const browser = new InlineChallengeAdapter('fixture', {
      url: 'https://fixture.test/', title: 'Fixture', html: '<div class="g-recaptcha"></div>'
    });
    const controller = new ChallengeController({ browser });
    await controller.inspect();
    const handoff = await controller.handoff({ taskId: 'active-task' });
    await expect(controller.resume({
      taskId: 'active-task', handoffId: handoff.handoff.id
    })).rejects.toThrow('still active');
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
    await expect(pauseController.handoff({ taskId: 'pause-task' })).rejects.toThrow('pause failed');
    expect(pauseController.state).toBe('failed');

    const cleared = new InlineChallengeAdapter('resume-failure', {
      url: 'https://fixture.test/', title: 'Fixture', html: '<div class="g-recaptcha"></div>'
    });
    const resumeController = new ChallengeController({
      browser: cleared,
      lifecycle: { pause() {}, resume: () => { throw new Error('resume failed'); } }
    });
    await resumeController.inspect();
    const handoff = await resumeController.handoff({ taskId: 'resume-task' });
    cleared.update({ url: 'https://fixture.test/', title: 'Fixture', html: '<main>Ready</main>' });
    await expect(resumeController.resume({
      taskId: 'resume-task', handoffId: handoff.handoff.id
    })).rejects.toThrow('resume failed');
    expect(resumeController.state).toBe('failed');
    await expect(resumeController.resume({
      taskId: 'resume-task', handoffId: handoff.handoff.id
    })).rejects.toThrow('consumed');
  });

  it('times out with bounded polling', async () => {
    const browser = new InlineChallengeAdapter('fixture', {
      url: 'https://fixture.test/', title: 'Fixture', html: '<div class="h-captcha"></div>'
    });
    const controller = new ChallengeController({ browser });
    await controller.inspect();
    const handoff = await controller.handoff({ taskId: 'timeout-task' });
    await expect(controller.wait({ timeoutMs: 30, pollMs: 25 })).rejects.toThrow('did not clear');
    expect(controller.state).toBe('timed-out');

    browser.update({ url: 'https://fixture.test/', title: 'Fixture', html: '<main>Completed late</main>' });
    await expect(controller.resume({
      taskId: 'timeout-task', handoffId: handoff.handoff.id
    })).resolves.toMatchObject({ finding: { status: 'clear' } });
    expect(controller.state).toBe('resumed');
  });

  it('rejects a late completion after a newer handoff generation replaces it', async () => {
    const browser = new InlineChallengeAdapter('tab-1', {
      url: 'https://fixture.test/a', title: 'Challenge A', html: '<div class="g-recaptcha"></div>'
    });
    const resume = vi.fn();
    const controller = new ChallengeController({
      browser,
      lifecycle: { pause() {}, resume }
    });

    await controller.inspect();
    const handoffA = await controller.handoff({ taskId: 'checkout-run' });

    browser.update({
      url: 'https://fixture.test/b', title: 'Challenge B', html: '<div class="h-captcha"></div>'
    });
    await controller.inspect();
    const handoffB = await controller.handoff({ taskId: 'checkout-run' });
    browser.update({
      url: 'https://fixture.test/ready', title: 'Ready', html: '<main>Ready</main>'
    });

    await expect(controller.resume({
      taskId: 'checkout-run',
      handoffId: handoffA.handoff.id
    })).rejects.toThrow('stale');
    expect(resume).not.toHaveBeenCalled();

    await expect(controller.resume({
      taskId: 'checkout-run',
      handoffId: handoffB.handoff.id
    })).resolves.toMatchObject({ finding: { status: 'clear' } });
    expect(resume).toHaveBeenCalledOnce();
  });

  it('serializes duplicate completion callbacks for one handoff', async () => {
    const browser = new InlineChallengeAdapter('tab-1', {
      url: 'https://fixture.test/', title: 'Challenge', html: '<div class="cf-turnstile"></div>'
    });
    let releaseResume!: () => void;
    const resumeGate = new Promise<void>(resolve => { releaseResume = resolve; });
    const resume = vi.fn(() => resumeGate);
    const controller = new ChallengeController({
      browser,
      lifecycle: { pause() {}, resume }
    });

    await controller.inspect();
    const handoff = await controller.handoff({ taskId: 'checkout-run' });
    browser.update({
      url: 'https://fixture.test/ready', title: 'Ready', html: '<main>Ready</main>'
    });

    const first = controller.resume({ taskId: 'checkout-run', handoffId: handoff.handoff.id });
    await vi.waitFor(() => expect(resume).toHaveBeenCalledOnce());
    const duplicate = controller.resume({ taskId: 'checkout-run', handoffId: handoff.handoff.id });
    expect(resume).toHaveBeenCalledOnce();
    releaseResume();

    await expect(Promise.all([first, duplicate])).resolves.toHaveLength(2);
    expect(resume).toHaveBeenCalledOnce();
    await expect(controller.resume({
      taskId: 'checkout-run', handoffId: handoff.handoff.id
    })).rejects.toThrow('consumed');
  });

  it('consumes a handoff before invoking a lifecycle that may partially fail', async () => {
    const browser = new InlineChallengeAdapter('tab-1', {
      url: 'https://fixture.test/', title: 'Challenge', html: '<div class="cf-turnstile"></div>'
    });
    const resume = vi.fn(() => { throw new Error('resume failed after side effect'); });
    const controller = new ChallengeController({
      browser,
      lifecycle: { pause() {}, resume }
    });

    await controller.inspect();
    const handoff = await controller.handoff({ taskId: 'checkout-run' });
    browser.update({
      url: 'https://fixture.test/ready', title: 'Ready', html: '<main>Ready</main>'
    });

    await expect(controller.resume({
      taskId: 'checkout-run', handoffId: handoff.handoff.id
    })).rejects.toThrow('resume failed after side effect');
    await expect(controller.resume({
      taskId: 'checkout-run', handoffId: handoff.handoff.id
    })).rejects.toThrow('consumed');
    expect(resume).toHaveBeenCalledOnce();
  });

  it('does not make a consumed handoff reusable when the resume event sink fails', async () => {
    const browser = new InlineChallengeAdapter('tab-1', {
      url: 'https://fixture.test/', title: 'Challenge', html: '<div class="cf-turnstile"></div>'
    });
    const resume = vi.fn();
    const controller = new ChallengeController({
      browser,
      lifecycle: { pause() {}, resume },
      events: {
        write(event) {
          if (event.type === 'resume') throw new Error('event sink failed');
        }
      }
    });

    await controller.inspect();
    const handoff = await controller.handoff({ taskId: 'checkout-run' });
    browser.update({
      url: 'https://fixture.test/ready', title: 'Ready', html: '<main>Ready</main>'
    });

    await expect(controller.resume({
      taskId: 'checkout-run', handoffId: handoff.handoff.id
    })).rejects.toThrow('event sink failed');
    await expect(controller.resume({
      taskId: 'checkout-run', handoffId: handoff.handoff.id
    })).rejects.toThrow('consumed');
    expect(resume).toHaveBeenCalledOnce();
  });

  it('invalidates an unconsumed handoff when the controller closes', async () => {
    const browser = new InlineChallengeAdapter('tab-1', {
      url: 'https://fixture.test/', title: 'Challenge', html: '<div class="cf-turnstile"></div>'
    });
    const resume = vi.fn();
    const controller = new ChallengeController({
      browser,
      lifecycle: { pause() {}, resume }
    });

    await controller.inspect();
    const handoff = await controller.handoff({ taskId: 'checkout-run' });
    controller.close();

    await expect(controller.resume({
      taskId: 'checkout-run', handoffId: handoff.handoff.id
    })).rejects.toThrow('stale');
    expect(resume).not.toHaveBeenCalled();
  });

  it('rejects a mismatched task before inspecting or resuming', async () => {
    const browser = new InlineChallengeAdapter('tab-1', {
      url: 'https://fixture.test/', title: 'Challenge', html: '<div class="cf-turnstile"></div>'
    });
    const observe = vi.spyOn(browser, 'observe');
    const resume = vi.fn();
    const controller = new ChallengeController({
      browser,
      lifecycle: { pause() {}, resume }
    });

    await controller.inspect();
    const handoff = await controller.handoff({ taskId: 'task-a' });
    observe.mockClear();

    await expect(controller.resume({
      taskId: 'task-b', handoffId: handoff.handoff.id
    })).rejects.toThrow('task');
    expect(observe).not.toHaveBeenCalled();
    expect(resume).not.toHaveBeenCalled();
  });

  it('does not accept a handoff identity from another tab controller', async () => {
    const firstBrowser = new InlineChallengeAdapter('tab-1', {
      url: 'https://fixture.test/one', title: 'One', html: '<div class="cf-turnstile"></div>'
    });
    const secondBrowser = new InlineChallengeAdapter('tab-2', {
      url: 'https://fixture.test/two', title: 'Two', html: '<div class="cf-turnstile"></div>'
    });
    const first = new ChallengeController({ browser: firstBrowser });
    const secondResume = vi.fn();
    const second = new ChallengeController({
      browser: secondBrowser,
      lifecycle: { pause() {}, resume: secondResume }
    });

    await first.inspect();
    const firstHandoff = await first.handoff({ taskId: 'checkout-run' });
    await second.inspect();
    await second.handoff({ taskId: 'checkout-run' });
    const observeSecond = vi.spyOn(secondBrowser, 'observe');
    observeSecond.mockClear();

    await expect(second.resume({
      taskId: 'checkout-run', handoffId: firstHandoff.handoff.id
    })).rejects.toThrow('unknown or stale');
    expect(observeSecond).not.toHaveBeenCalled();
    expect(secondResume).not.toHaveBeenCalled();
  });
});
