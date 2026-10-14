import { expect, it } from 'vitest';
import { JetStandaloneChallengeAdapter } from '../src/browser/jet-standalone.js';

const fakeJsonlProcess = String.raw`
const readline = require('node:readline');
const lines = readline.createInterface({ input: process.stdin });
lines.on('line', line => {
  const command = JSON.parse(line);
  let value = null;
  if (command.op === 'evaluate') value = { result: { value: JSON.stringify({
    url: 'https://fixture.test/', title: 'Standalone fixture',
    html: '<div class="h-captcha"></div>', text: 'Verify', runtimeSignals: [],
    capturedAt: '2026-10-14T00:00:00.000Z'
  }) } };
  process.stdout.write(JSON.stringify({ ok: true, value }) + '\n');
});
`;

it('owns an ordered Jet JSONL process and closes it cleanly', async () => {
  const adapter = await JetStandaloneChallengeAdapter.launch({
    id: 'standalone-fixture',
    command: process.execPath,
    args: ['-e', fakeJsonlProcess],
    commandTimeoutMs: 2_000,
    sessionTimeoutMs: 5_000
  });
  try {
    const [first, second] = await Promise.all([adapter.observe(), adapter.observe()]);
    expect(first.title).toBe('Standalone fixture');
    expect(second.html).toContain('h-captcha');
  } finally {
    await adapter.close();
  }
});
