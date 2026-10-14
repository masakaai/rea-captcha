import { pathToFileURL } from 'node:url';
import { ChallengeController } from 'rea-captcha';
import { JetBrowserChallengeAdapter } from 'rea-captcha/jet-browser';

const modulePath = process.env.JET_BROWSER_MODULE;
const apiKey = process.env.MASAKA_API_KEY;
const sessionId = process.env.JET_BROWSER_SESSION_ID;
if (!modulePath || !apiKey || !sessionId) {
  throw new Error('JET_BROWSER_MODULE, MASAKA_API_KEY, and JET_BROWSER_SESSION_ID are required.');
}

const loaded = await import(pathToFileURL(modulePath).href) as {
  JetBrowser: new (options: { apiKey: string; baseUrl?: string }) => {
    evaluate(id: string, expression: string, options?: { signal?: AbortSignal }): Promise<unknown>;
  }
};
const client = new loaded.JetBrowser({
  apiKey,
  ...(process.env.MASAKA_BASE_URL ? { baseUrl: process.env.MASAKA_BASE_URL } : {})
});
const controller = new ChallengeController({
  browser: new JetBrowserChallengeAdapter({ client, sessionId })
});

const inspection = await controller.inspect();
process.stdout.write(`${JSON.stringify(inspection, null, 2)}\n`);
// Browser creation and shutdown remain with the Jet Browser session owner.
controller.close();
