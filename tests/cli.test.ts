import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { runCli } from '../src/cli.js';

describe('agent-first CLI setup', () => {
  const temporaryDirectories: string[] = [];

  afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all(temporaryDirectories.splice(0).map(path => rm(path, { recursive: true, force: true })));
  });

  it('creates a generic Chrome CDP session without Jet Browser configuration', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'rea-captcha-'));
    temporaryDirectories.push(directory);
    const path = join(directory, 'config.json');
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    await runCli(['setup', '--config', path, '--yes']);

    const created = JSON.parse(await readFile(path, 'utf8')) as {
      sessions: Record<string, { adapter: string; endpoint: string }>;
    };
    expect(created.sessions['local-chrome']).toMatchObject({
      adapter: 'playwright-cdp',
      endpoint: 'http://127.0.0.1:9222'
    });
    expect(JSON.stringify(created)).not.toMatch(/jet/i);
  });
});
