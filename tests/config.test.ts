import { describe, expect, it } from 'vitest';
import { configurationSchema } from '../src/composition/config.js';

describe('configuration policy gates', () => {
  it('keeps local image recognition disabled by default', () => {
    const parsed = configurationSchema.parse({
      version: 1,
      sessions: {
        browser: { adapter: 'playwright-cdp', endpoint: 'http://127.0.0.1:9222' }
      }
    });
    expect(parsed.sessions.browser?.allowLocalImageText).toBe(false);
    expect(parsed.sessions.browser?.authorizedOrigins).toEqual([]);
  });

  it('accepts an explicit local-processing gate for a named session', () => {
    const parsed = configurationSchema.parse({
      version: 1,
      sessions: {
        browser: {
          adapter: 'playwright-cdp',
          endpoint: 'http://127.0.0.1:9222',
          allowLocalImageText: true,
          authorizedOrigins: ['https://fixture.test']
        }
      }
    });
    expect(parsed.sessions.browser?.allowLocalImageText).toBe(true);
  });
});
