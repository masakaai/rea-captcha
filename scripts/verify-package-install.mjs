#!/usr/bin/env node
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const run = (command, args, options = {}) => new Promise((resolvePromise, reject) => {
  const child = spawn(command, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  child.once('error', reject);
  child.once('close', code => code === 0
    ? resolvePromise({ stdout, stderr })
    : reject(new Error(`${command} ${args.join(' ')} exited ${code}\n${stdout}\n${stderr}`)));
});

const temporaryRoot = await mkdtemp(join(tmpdir(), 'rea-captcha-package-'));
try {
  const packed = await run('npm', ['pack', '--json', '--pack-destination', temporaryRoot], { cwd: resolve('.') });
  const report = JSON.parse(packed.stdout);
  const tarball = join(temporaryRoot, report[0].filename);
  const consumer = join(temporaryRoot, 'consumer');
  await mkdir(consumer);
  await writeFile(join(consumer, 'package.json'), `${JSON.stringify({ private: true, type: 'module' }, null, 2)}\n`);
  await run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], { cwd: consumer });
  const probe = [
    "import { ChallengeController } from 'rea-captcha';",
    "import { PlaywrightChallengeAdapter } from 'rea-captcha/playwright';",
    "import { connectCdpChallenge } from 'rea-captcha/cdp';",
    "if (![ChallengeController, PlaywrightChallengeAdapter, connectCdpChallenge].every(Boolean)) process.exit(1);"
  ].join('\n');
  await writeFile(join(consumer, 'probe.mjs'), `${probe}\n`);
  await run(process.execPath, ['probe.mjs'], { cwd: consumer });
  const cli = await run(process.execPath, ['node_modules/rea-captcha/scripts/rea-captcha.mjs', 'help'], { cwd: consumer });
  if (!cli.stdout.includes('rea-captcha setup')) throw new Error('Installed CLI did not return its help contract.');
  const installed = JSON.parse(await readFile(join(consumer, 'node_modules/rea-captcha/package.json'), 'utf8'));
  process.stdout.write(`Installed ${installed.name}@${installed.version} from ${report[0].filename}; SDK exports and CLI passed.\n`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
