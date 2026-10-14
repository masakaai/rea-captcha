import type { ChallengeObservation } from '../domain/challenge.js';

export const parseObservation = (value: unknown): ChallengeObservation => {
  const decoded = typeof value === 'string' ? JSON.parse(value) as unknown : value;
  if (!decoded || typeof decoded !== 'object') throw new Error('Browser observation must be an object.');
  const record = decoded as Record<string, unknown>;
  if (typeof record.url !== 'string' || typeof record.title !== 'string') throw new Error('Browser observation is missing url or title.');
  try { new URL(record.url); }
  catch { throw new Error('Browser observation contains an invalid url.'); }
  const hasHtml = typeof record.html === 'string';
  const hasText = typeof record.text === 'string';
  const hasRuntimeSignals = Array.isArray(record.runtimeSignals) && record.runtimeSignals.every(item => typeof item === 'string');
  if (!hasHtml && !hasText && !hasRuntimeSignals) throw new Error('Browser observation has no valid evidence surface.');
  if (typeof record.capturedAt !== 'string' || Number.isNaN(Date.parse(record.capturedAt))) {
    throw new Error('Browser observation is missing a valid capturedAt timestamp.');
  }
  return {
    url: record.url,
    title: record.title,
    ...(hasHtml ? { html: record.html as string } : {}),
    ...(hasText ? { text: record.text as string } : {}),
    ...(hasRuntimeSignals ? { runtimeSignals: record.runtimeSignals as string[] } : {}),
    capturedAt: record.capturedAt
  };
};
