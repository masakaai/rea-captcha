import { describe, expect, it } from 'vitest';
import { parseObservation } from '../src/browser/observation.js';

describe('browser observation boundary', () => {
  it('preserves complete evidence and capture provenance', () => {
    const capturedAt = '2026-10-14T00:00:00.000Z';
    expect(parseObservation({
      url: 'about:blank', title: '', html: '', text: '', runtimeSignals: [], capturedAt
    })).toEqual({ url: 'about:blank', title: '', html: '', text: '', runtimeSignals: [], capturedAt });
  });

  it.each([
    { url: 'not a url', title: '', html: '', capturedAt: '2026-10-14T00:00:00.000Z' },
    { url: 'https://fixture.test', title: '', capturedAt: '2026-10-14T00:00:00.000Z' },
    { url: 'https://fixture.test', title: '', html: '' }
  ])('rejects incomplete or malformed evidence instead of reporting clear', value => {
    expect(() => parseObservation(value)).toThrow(/observation/i);
  });
});
