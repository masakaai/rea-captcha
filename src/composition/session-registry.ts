import { pathToFileURL } from 'node:url';
import { ChallengeController } from '../application/controller.js';
import { JsonlChallengeEventSink } from '../application/jsonl-event-sink.js';
import { ChallengePolicy } from '../application/policy.js';
import type { BrowserChallengePort } from '../application/ports.js';
import { connectCdpChallenge, type CdpChallengeConnection } from '../browser/cdp.js';
import { JetBrowserChallengeAdapter, type JetBrowserClientPort } from '../browser/jet-browser.js';
import { JetStandaloneChallengeAdapter } from '../browser/jet-standalone.js';
import type { ReaCaptchaConfiguration, SessionConfiguration } from './config.js';

type JetBrowserConstructor = new (options: { apiKey: string; baseUrl?: string }) => JetBrowserClientPort;

interface OwnedSession {
  readonly controller: ChallengeController;
  close(): Promise<void>;
}

export class ChallengeSessionRegistry {
  readonly #config: ReaCaptchaConfiguration;
  readonly #sessions = new Map<string, Promise<OwnedSession>>();

  constructor(config: ReaCaptchaConfiguration) {
    this.#config = config;
  }

  async get(sessionId: string): Promise<ChallengeController> {
    const configured = this.#config.sessions[sessionId];
    if (!configured) throw new Error(`Unknown session_id: ${sessionId}`);
    let pending = this.#sessions.get(sessionId);
    if (!pending) {
      pending = this.#create(sessionId, configured);
      this.#sessions.set(sessionId, pending);
      pending.catch(() => this.#sessions.delete(sessionId));
    }
    return (await pending).controller;
  }

  async close(): Promise<void> {
    const sessions = await Promise.allSettled(this.#sessions.values());
    this.#sessions.clear();
    await Promise.all(sessions.flatMap(result => result.status === 'fulfilled' ? [result.value.close()] : []));
  }

  async #create(id: string, configured: SessionConfiguration): Promise<OwnedSession> {
    let browser: BrowserChallengePort;
    let cleanup: () => Promise<void> = async () => {};
    if (configured.adapter === 'playwright-cdp') {
      const connection: CdpChallengeConnection = await connectCdpChallenge({
        id,
        endpoint: configured.endpoint,
        agentActions: {
          authorizedOrigins: configured.authorizedOrigins,
          allowProviderTestAutomation: configured.allowProviderTestAutomation,
          ...(configured.submitSelector ? { submitSelector: configured.submitSelector } : {}),
          ...(configured.imageTextValue ? { imageTextValue: configured.imageTextValue } : {})
        }
      });
      browser = connection.adapter;
      cleanup = connection.close;
    } else if (configured.adapter === 'jet-browser') {
      const apiKey = process.env[configured.apiKeyEnv];
      if (!apiKey) throw new Error(`Environment variable ${configured.apiKeyEnv} is required for Jet Browser session ${id}.`);
      const moduleUrl = configured.module.startsWith('file:')
        ? configured.module
        : pathToFileURL(configured.module).href;
      const loaded = await import(moduleUrl) as { JetBrowser?: JetBrowserConstructor; MasakaBrowser?: JetBrowserConstructor };
      const Constructor = loaded.JetBrowser ?? loaded.MasakaBrowser;
      if (!Constructor) throw new Error(`Jet Browser module does not export JetBrowser or MasakaBrowser: ${configured.module}`);
      const options = configured.baseUrl ? { apiKey, baseUrl: configured.baseUrl } : { apiKey };
      const client = new Constructor(options);
      browser = new JetBrowserChallengeAdapter({ id, client, sessionId: configured.sessionId });
    } else {
      const adapter = await JetStandaloneChallengeAdapter.launch({
        id,
        command: configured.command,
        args: configured.args,
        commandTimeoutMs: configured.commandTimeoutMs,
        sessionTimeoutMs: configured.sessionTimeoutMs,
        ...(configured.cwd ? { cwd: configured.cwd } : {})
      });
      browser = adapter;
      cleanup = () => adapter.close();
    }
    const controller = new ChallengeController({
      browser,
      policy: new ChallengePolicy({
        authorizedOrigins: configured.authorizedOrigins,
        allowLocalImageText: configured.allowLocalImageText,
        allowProviderTestAutomation: configured.adapter === 'playwright-cdp'
          ? configured.allowProviderTestAutomation
          : false
      }),
      ...(this.#config.eventLog ? { events: new JsonlChallengeEventSink(this.#config.eventLog) } : {})
    });
    return {
      controller,
      close: async () => { controller.close(); await cleanup(); }
    };
  }
}
