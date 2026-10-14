import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { z } from 'zod';

const jetSession = z.object({
  adapter: z.literal('jet-browser'),
  module: z.string().min(1),
  sessionId: z.string().min(1),
  apiKeyEnv: z.string().min(1).default('MASAKA_API_KEY'),
  baseUrl: z.url().optional(),
  allowLocalImageText: z.boolean().default(false),
  authorizedOrigins: z.array(z.url()).default([])
});

const cdpSession = z.object({
  adapter: z.literal('playwright-cdp'),
  endpoint: z.url(),
  allowLocalImageText: z.boolean().default(false),
  authorizedOrigins: z.array(z.url()).default([])
});

const jetStandaloneSession = z.object({
  adapter: z.literal('jet-standalone'),
  command: z.string().min(1),
  args: z.array(z.string()).default([]),
  cwd: z.string().min(1).optional(),
  commandTimeoutMs: z.number().int().min(100).max(300_000).default(30_000),
  sessionTimeoutMs: z.number().int().min(1_000).max(3_600_000).default(300_000),
  allowLocalImageText: z.boolean().default(false),
  authorizedOrigins: z.array(z.url()).default([])
});

export const configurationSchema = z.object({
  version: z.literal(1),
  eventLog: z.string().min(1).optional(),
  sessions: z.record(z.string().min(1), z.discriminatedUnion('adapter', [jetSession, jetStandaloneSession, cdpSession]))
});

export type ReaCaptchaConfiguration = z.infer<typeof configurationSchema>;
export type SessionConfiguration = ReaCaptchaConfiguration['sessions'][string];

export const defaultConfigPath = (): string => resolve(homedir(), '.config', 'rea-captcha', 'config.json');

export async function loadConfiguration(path = defaultConfigPath()): Promise<ReaCaptchaConfiguration> {
  let value: unknown;
  try { value = JSON.parse(await readFile(resolve(path), 'utf8')) as unknown; }
  catch (error) {
    if (error instanceof SyntaxError) throw new Error(`Invalid JSON in rea-captcha config: ${resolve(path)}`);
    throw new Error(`Unable to read rea-captcha config at ${resolve(path)}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const parsed = configurationSchema.safeParse(value);
  if (!parsed.success) throw new Error(`Invalid rea-captcha config: ${z.prettifyError(parsed.error)}`);
  return parsed.data;
}
