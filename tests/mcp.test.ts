import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, describe, expect, it } from 'vitest';
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
  });
});
