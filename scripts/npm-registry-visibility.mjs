import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const viewPublishedPackage = async packageSpec => {
  const { stdout } = await execFileAsync('npm', ['view', packageSpec, '--json'], {
    timeout: 30_000,
    maxBuffer: 1024 * 1024
  });
  return JSON.parse(stdout);
};

export async function fetchPublishedPackage(
  packageSpec,
  {
    attempts = 8,
    initialDelayMs = 5_000,
    maxDelayMs = 30_000,
    viewPackage = viewPublishedPackage,
    sleep = wait,
    onRetry = message => process.stderr.write(`${message}\n`)
  } = {}
) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await viewPackage(packageSpec);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;

      const delayMs = Math.min(initialDelayMs * 2 ** (attempt - 1), maxDelayMs);
      onRetry(`Public npm manifest for ${packageSpec} is not available yet; retrying in ${delayMs}ms (${attempt + 1}/${attempts}).`);
      await sleep(delayMs);
    }
  }

  throw lastError;
}
