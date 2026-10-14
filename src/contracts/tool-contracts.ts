import { z } from 'zod';

export const sessionInput = z.object({
  session_id: z.string().min(1).max(200).describe('Configured browser session identifier.')
});

export const waitInput = sessionInput.extend({
  timeout_ms: z.number().int().min(1).max(3_600_000).default(120_000),
  poll_ms: z.number().int().min(25).max(60_000).default(1_000)
});

export const analyzeInput = z.object({
  url: z.url().describe('URL of the page observed by the calling agent.'),
  title: z.string().max(2_000).default(''),
  html: z.string().max(2_000_000).optional(),
  text: z.string().max(500_000).optional(),
  runtime_signals: z.array(z.string().max(2_000)).max(100).optional()
}).refine(
  value => value.html !== undefined || value.text !== undefined || value.runtime_signals !== undefined,
  { message: 'Provide at least one evidence surface: html, text, or runtime_signals.' }
);

export const toolNames = [
  'captcha_inspect',
  'captcha_wait',
  'captcha_handoff',
  'captcha_resume',
  'captcha_analyze'
] as const;

export type CaptchaToolName = (typeof toolNames)[number];
