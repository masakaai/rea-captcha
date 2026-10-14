import { ChallengeController, ChallengePolicy } from 'rea-captcha';
import { connectCdpChallenge } from 'rea-captcha/cdp';

const authorizedOrigin = process.env.AUTHORIZED_ORIGIN ?? 'http://127.0.0.1:4173';
const connection = await connectCdpChallenge({
  id: 'existing-browser',
  endpoint: process.env.CDP_ENDPOINT ?? 'http://127.0.0.1:9222',
  agentActions: {
    authorizedOrigins: [authorizedOrigin],
    allowProviderTestAutomation: true,
    submitSelector: 'button[type="submit"]',
    imageTextValue: 'LOCAL42'
  }
});

const controller = new ChallengeController({
  browser: connection.adapter,
  policy: new ChallengePolicy({
    authorizedOrigins: [authorizedOrigin],
    allowLocalImageText: true,
    allowProviderTestAutomation: true
  })
});

try {
  const inspection = await controller.inspect();
  if (inspection.policy.decision === 'agent-action' || inspection.policy.decision === 'local-processing') {
    await controller.complete({ timeoutMs: 30_000, pollMs: 100 });
    await controller.resume();
  }
} finally {
  controller.close();
  await connection.close();
}
