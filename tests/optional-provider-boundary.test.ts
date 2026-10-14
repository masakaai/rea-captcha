import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('optional provider boundary', () => {
  it('keeps Jet Browser out of runtime and peer dependencies', async () => {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const installedProviders = Object.keys(packageJson.dependencies ?? {});
    expect(installedProviders.filter(name => /jet/i.test(name))).toEqual([]);
  });

  it('does not expose a Jet-specific adapter from the core entrypoint', async () => {
    const source = await readFile(new URL('../src/index.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(/jet-browser|jet-standalone/i);
  });
});
