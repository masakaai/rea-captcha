import { runCli } from './cli.js';

runCli().catch(error => {
  process.stderr.write(`rea-captcha: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
