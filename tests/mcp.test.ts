import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChallengeController } from '../src/application/controller.js';
import { InlineChallengeAdapter } from '../src/browser/inline.js';
import { createReaCaptchaMcpServer } from '../src/server/mcp.js';

describe('MCP contracts', () => {
  const close: Array<() => Promise<void>> = [];
  afterEach(async () => { await Promise.all(close.splice(0).map(item => item())); });

  it('advertises session lifecycle tools plus zero-config analysis', async () => {
    const controller = new ChallengeController({ browser: new InlineChallengeAdapter('fixture', {
      url: 'https://fixture.test/', title: 'Fixture', html: '<div class="g-recaptcha"></div>'
    }) });
    const server = createReaCaptchaMcpServer({ get: async id => {
      if (id !== 'fixture') throw new Error('unknown');
      return controller;
    } });
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    close.push(async () => client.close(), async () => server.close());

    const listed = await client.listTools();
    expect(listed.tools.map(tool => tool.name)).toEqual([
      'captcha_inspect', 'captcha_complete', 'captcha_wait', 'captcha_handoff', 'captcha_resume', 'captcha_analyze'
    ]);
    const result = await client.callTool({ name: 'captcha_inspect', arguments: { session_id: 'fixture' } });
    expect(result.structuredContent).toMatchObject({
      state: 'blocked',
      finding: { kind: 'recaptcha', status: 'detected' },
      policy: { decision: 'human-handoff' }
    });

    const analyzed = await client.callTool({
      name: 'captcha_analyze',
      arguments: {
        url: 'https://fixture.test/checkout',
        title: 'Checkout',
        html: '<div class="cf-turnstile"></div>'
      }
    });
    expect(analyzed.structuredContent).toMatchObject({
      state: 'analyzed',
      finding: { kind: 'turnstile', status: 'detected' },
      policy: { decision: 'human-handoff' }
    });

    const textOnly = await client.callTool({
      name: 'captcha_analyze',
      arguments: {
        url: 'https://fixture.test/recaptcha',
        title: 'Verification',
        text: "I'm not a robot reCAPTCHA"
      }
    });
    expect(textOnly.structuredContent).toMatchObject({
      state: 'analyzed',
      finding: { kind: 'recaptcha', status: 'detected' },
      policy: { decision: 'human-handoff' }
    });
  });

  it('round-trips a task-scoped handoff identity and consumes it once', async () => {
    const browser = new InlineChallengeAdapter('fixture', {
      url: 'https://fixture.test/', title: 'Fixture', html: '<div class="g-recaptcha"></div>'
    });
    const resume = vi.fn();
    const controller = new ChallengeController({
      browser,
      lifecycle: { pause() {}, resume }
    });
    const server = createReaCaptchaMcpServer({ get: async () => controller });
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    close.push(async () => client.close(), async () => server.close());

    const listed = await client.listTools();
    const handoffTool = listed.tools.find(tool => tool.name === 'captcha_handoff');
    const resumeTool = listed.tools.find(tool => tool.name === 'captcha_resume');
    expect(handoffTool?.inputSchema.required).toEqual(['session_id', 'task_id']);
    expect(resumeTool?.inputSchema.required).toEqual(['session_id']);
    expect(resumeTool?.inputSchema.properties).toHaveProperty('task_id');
    expect(resumeTool?.inputSchema.properties).toHaveProperty('handoff_id');

    await client.callTool({ name: 'captcha_inspect', arguments: { session_id: 'fixture' } });
    const handedOff = await client.callTool({
      name: 'captcha_handoff',
      arguments: { session_id: 'fixture', task_id: 'checkout-run' }
    });
    expect(handedOff.structuredContent).toMatchObject({
      state: 'awaiting-human',
      handoff: { taskId: 'checkout-run', tabId: 'fixture', generation: 1 }
    });
    const handoffId = (handedOff.structuredContent as { handoff: { id: string } }).handoff.id;

    const incompleteResume = await client.callTool({
      name: 'captcha_resume',
      arguments: { session_id: 'fixture', task_id: 'checkout-run' }
    });
    expect(incompleteResume.isError).toBe(true);
    expect(resume).not.toHaveBeenCalled();

    browser.update({ url: 'https://fixture.test/ready', title: 'Ready', html: '<main>Ready</main>' });
    const resumed = await client.callTool({
      name: 'captcha_resume',
      arguments: { session_id: 'fixture', task_id: 'checkout-run', handoff_id: handoffId }
    });
    expect(resumed.structuredContent).toMatchObject({ state: 'resumed', finding: { status: 'clear' } });
    expect(resume).toHaveBeenCalledOnce();

    const duplicate = await client.callTool({
      name: 'captcha_resume',
      arguments: { session_id: 'fixture', task_id: 'checkout-run', handoff_id: handoffId }
    });
    expect(duplicate.isError).toBe(true);
    expect(duplicate.content).toEqual([
      expect.objectContaining({ type: 'text', text: expect.stringContaining('consumed') })
    ]);
    expect(resume).toHaveBeenCalledOnce();
  });
});
