import { describe, expect, it, vi } from 'vitest';
import { fetchPublishedPackage } from '../scripts/npm-registry-visibility.mjs';

describe('MCP Registry npm visibility preflight', () => {
  it('returns a visible package without waiting', async () => {
    const viewPackage = vi.fn().mockResolvedValue({ version: '0.1.1', mcpName: 'io.github.masakaai/rea-captcha' });
    const sleep = vi.fn();

    await expect(fetchPublishedPackage('rea-captcha@0.1.1', { viewPackage, sleep })).resolves.toMatchObject({
      version: '0.1.1'
    });
    expect(viewPackage).toHaveBeenCalledOnce();
    expect(sleep).not.toHaveBeenCalled();
  });

  it('backs off until the exact npm manifest becomes visible', async () => {
    const viewPackage = vi
      .fn()
      .mockRejectedValueOnce(new Error('E404'))
      .mockRejectedValueOnce(new Error('E404'))
      .mockResolvedValue({ version: '0.1.1', mcpName: 'io.github.masakaai/rea-captcha' });
    const sleep = vi.fn().mockResolvedValue(undefined);
    const onRetry = vi.fn();

    await expect(
      fetchPublishedPackage('rea-captcha@0.1.1', {
        attempts: 4,
        initialDelayMs: 5,
        maxDelayMs: 8,
        viewPackage,
        sleep,
        onRetry
      })
    ).resolves.toMatchObject({ version: '0.1.1' });
    expect(sleep.mock.calls).toEqual([[5], [8]]);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it('stops after the bounded number of attempts', async () => {
    const failure = new Error('registry unavailable');
    const viewPackage = vi.fn().mockRejectedValue(failure);
    const sleep = vi.fn().mockResolvedValue(undefined);

    await expect(
      fetchPublishedPackage('rea-captcha@0.1.1', {
        attempts: 3,
        initialDelayMs: 1,
        maxDelayMs: 1,
        viewPackage,
        sleep,
        onRetry: () => {}
      })
    ).rejects.toBe(failure);
    expect(viewPackage).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });
});
