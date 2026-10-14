import { expect, it, vi } from 'vitest';
import { JetBrowserChallengeAdapter } from '../src/browser/jet-browser.js';

it('uses the borrowed Jet Browser session and the versioned evaluate operation shape', async () => {
  const evaluate = vi.fn(async (_sessionId: string, _expression: string) => ({
    evaluation: JSON.stringify({
      url: 'https://fixture.test/',
      title: 'Jet fixture',
      html: '<div class="cf-turnstile"></div>',
      text: 'Verify',
      runtimeSignals: [],
      capturedAt: '2026-10-14T00:00:00.000Z'
    })
  }));
  const adapter = new JetBrowserChallengeAdapter({ client: { evaluate }, sessionId: 'jet-session' });
  const result = await adapter.observe();
  expect(result.title).toBe('Jet fixture');
  expect(evaluate).toHaveBeenCalledOnce();
  expect(evaluate.mock.calls[0]?.[0]).toBe('jet-session');
  expect(evaluate.mock.calls[0]?.[1]).toContain('document.documentElement');
});
