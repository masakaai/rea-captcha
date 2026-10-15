import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { ChallengeInspection } from '../domain/challenge.js';
import { analyzeInput, sessionInput, toolNames, waitInput } from '../contracts/tool-contracts.js';
import type { ChallengeController } from '../application/controller.js';
import { DomChallengeDetector } from '../detector/dom-detector.js';
import { ChallengePolicy } from '../application/policy.js';

export interface ControllerResolver {
  get(sessionId: string): Promise<ChallengeController>;
}

const toolResult = (inspection: ChallengeInspection, state: string) => {
  const value = { state, ...inspection };
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value) }],
    structuredContent: value
  };
};

export function createReaCaptchaMcpServer(resolver: ControllerResolver): McpServer {
  const server = new McpServer({ name: 'rea-captcha', version: '0.2.4' }, {
    maxToolInputElements: 16,
    instructions: 'Use captcha_analyze for page evidence supplied by an agent. In a configured existing browser session: inspect; use captcha_complete only when policy returns agent-action or local-processing; otherwise request handoff; then resume only after fresh clear evidence.'
  });

  server.registerTool(toolNames[0], {
    title: 'Inspect verification challenge',
    description: 'Inspect a configured browser session for an active verification challenge and return evidence plus the handling policy.',
    inputSchema: sessionInput,
    annotations: { readOnlyHint: true, openWorldHint: false }
  }, async ({ session_id }, extra) => {
    const controller = await resolver.get(session_id);
    return toolResult(await controller.inspect(extra.signal), controller.state);
  });

  server.registerTool(toolNames[1], {
    title: 'Complete authorized verification',
    description: 'Let the agent complete an authorized provider-test or owned-origin challenge in the existing browser session, then wait for fresh server-validated evidence.',
    inputSchema: waitInput,
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true }
  }, async ({ session_id, timeout_ms, poll_ms }, extra) => {
    const controller = await resolver.get(session_id);
    return toolResult(await controller.complete({ timeoutMs: timeout_ms, pollMs: poll_ms, signal: extra.signal }), controller.state);
  });

  server.registerTool(toolNames[2], {
    title: 'Wait for verification',
    description: 'Poll the same browser session until its verification challenge clears or the bounded timeout expires.',
    inputSchema: waitInput,
    annotations: { readOnlyHint: true, openWorldHint: false }
  }, async ({ session_id, timeout_ms, poll_ms }, extra) => {
    const controller = await resolver.get(session_id);
    return toolResult(await controller.wait({ timeoutMs: timeout_ms, pollMs: poll_ms, signal: extra.signal }), controller.state);
  });

  server.registerTool(toolNames[3], {
    title: 'Request human handoff',
    description: 'Mark the current challenge as awaiting a person in the existing browser session.',
    inputSchema: sessionInput,
    annotations: { readOnlyHint: false, openWorldHint: false }
  }, async ({ session_id }) => {
    const controller = await resolver.get(session_id);
    return toolResult(await controller.handoff(), controller.state);
  });

  server.registerTool(toolNames[4], {
    title: 'Verify and resume',
    description: 'Re-inspect the existing browser session and resume its agent lifecycle only after the challenge is clear.',
    inputSchema: sessionInput,
    annotations: { readOnlyHint: false, openWorldHint: false }
  }, async ({ session_id }, extra) => {
    const controller = await resolver.get(session_id);
    return toolResult(await controller.resume(extra.signal), controller.state);
  });

  server.registerTool(toolNames[5], {
    title: 'Analyze page evidence',
    description: 'Analyze URL, title, HTML, text, or runtime signals already available to the calling agent. This read-only tool needs no configured browser adapter and does not control or preserve a browser session.',
    inputSchema: analyzeInput,
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ url, title, html, text, runtime_signals }) => {
    const finding = new DomChallengeDetector().detect({
      url,
      title,
      ...(html !== undefined ? { html } : {}),
      ...(text !== undefined ? { text } : {}),
      ...(runtime_signals !== undefined ? { runtimeSignals: runtime_signals } : {}),
      capturedAt: new Date().toISOString()
    });
    return toolResult({ finding, policy: new ChallengePolicy().decide(finding) }, 'analyzed');
  });
  return server;
}

export async function runStdioMcpServer(resolver: ControllerResolver): Promise<McpServer> {
  const server = createReaCaptchaMcpServer(resolver);
  await server.connect(new StdioServerTransport());
  return server;
}
