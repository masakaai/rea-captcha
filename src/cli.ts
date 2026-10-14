import { access, mkdir, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { delimiter, dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { ChallengeSessionRegistry } from './composition/session-registry.js';
import { configurationSchema, defaultConfigPath, loadConfiguration, type ReaCaptchaConfiguration } from './composition/config.js';
import { runStdioMcpServer } from './server/mcp.js';

interface ParsedArguments {
  readonly command: string;
  readonly options: ReadonlyMap<string, string | true>;
}

const parseArguments = (argv: readonly string[]): ParsedArguments => {
  const [command = 'help', ...rest] = argv;
  const options = new Map<string, string | true>();
  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (!item?.startsWith('--')) throw new Error(`Unexpected argument: ${item ?? ''}`);
    const key = item.slice(2);
    const next = rest[index + 1];
    if (next && !next.startsWith('--')) { options.set(key, next); index += 1; }
    else options.set(key, true);
  }
  return { command, options };
};

const stringOption = (options: ReadonlyMap<string, string | true>, key: string): string | undefined => {
  const value = options.get(key);
  if (value === true) throw new Error(`--${key} requires a value.`);
  return value;
};

const shellQuote = (value: string): string => `'${value.replaceAll("'", "'\\''")}'`;

const mcpLaunch = (configPath: string): { command: string; args: string[] } => ({
  command: process.execPath,
  args: [resolve(process.argv[1] ?? 'scripts/rea-captcha.mjs'), 'mcp', '--config', configPath]
});

const codexCommand = (configPath: string): string => {
  const launch = mcpLaunch(configPath);
  return ['codex', 'mcp', 'add', 'rea-captcha', '--', launch.command, ...launch.args].map(shellQuote).join(' ');
};

const emptyConfiguration = { version: 1, sessions: {} } as const satisfies ReaCaptchaConfiguration;

const setupConfiguration = (options: ReadonlyMap<string, string | true>): ReaCaptchaConfiguration => {
  const preset = stringOption(options, 'preset') ?? 'chrome-cdp';
  if (preset === 'empty') return emptyConfiguration;
  if (preset !== 'chrome-cdp') throw new Error(`Unknown setup preset: ${preset}. Expected chrome-cdp or empty.`);
  const session = stringOption(options, 'session') ?? 'local-chrome';
  if (!session.trim() || session.length > 200) throw new Error('--session must contain 1 to 200 characters.');
  const endpoint = stringOption(options, 'endpoint') ?? 'http://127.0.0.1:9222';
  return configurationSchema.parse({
    version: 1,
    sessions: { [session]: { adapter: 'playwright-cdp', endpoint } }
  });
};

async function executableAvailable(command: string, cwd?: string): Promise<boolean> {
  const check = async (candidate: string): Promise<boolean> => {
    try { await access(candidate, process.platform === 'win32' ? constants.F_OK : constants.X_OK); return true; }
    catch { return false; }
  };
  if (command.includes('/') || command.includes('\\')) return check(resolve(cwd ?? process.cwd(), command));
  const extensions = process.platform === 'win32'
    ? ['', ...(process.env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD').split(';')]
    : [''];
  for (const directory of (process.env.PATH ?? '').split(delimiter).filter(Boolean)) {
    for (const extension of extensions) {
      if (await check(join(directory, `${command}${extension}`))) return true;
    }
  }
  return false;
}

async function setup(options: ReadonlyMap<string, string | true>): Promise<void> {
  const path = resolve(stringOption(options, 'config') ?? defaultConfigPath());
  const configuration = setupConfiguration(options);
  let exists = true;
  try { await access(path, constants.F_OK); } catch { exists = false; }
  if (exists) {
    await loadConfiguration(path);
    stdout.write(`Configuration already valid: ${path}\n`);
    return;
  }
  stdout.write(`Planned change: create ${path}\n`);
  let approved = options.get('yes') === true;
  if (!approved && stdin.isTTY) {
    const prompt = createInterface({ input: stdin, output: stdout });
    approved = /^y(?:es)?$/i.test(await prompt.question('Apply this change? [y/N] '));
    prompt.close();
  }
  if (!approved) {
    stdout.write('No files changed. Re-run with --yes to apply non-interactively.\n');
    return;
  }
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  await writeFile(path, `${JSON.stringify(configuration, null, 2)}\n`, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
  stdout.write(`Created ${path}\n${Object.keys(configuration.sessions).length > 0 ? 'Default provider: generic Playwright CDP. Run rea-captcha doctor after starting your browser with remote debugging.' : 'Add a browser session before using stateful handoff.'}\n`);
  if (Object.keys(configuration.sessions).length > 0) stdout.write(`Codex registration command:\n${codexCommand(path)}\n`);
}

async function doctor(options: ReadonlyMap<string, string | true>): Promise<void> {
  const path = resolve(stringOption(options, 'config') ?? defaultConfigPath());
  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];
  const major = Number(process.versions.node.split('.')[0]);
  checks.push({ name: 'Node.js', ok: major >= 22, detail: process.versions.node });
  try {
    const config = await loadConfiguration(path);
    const sessionCount = Object.keys(config.sessions).length;
    checks.push({ name: 'Configuration', ok: true, detail: path });
    checks.push({ name: 'Configured sessions', ok: sessionCount > 0, detail: String(sessionCount) });
    for (const [id, session] of Object.entries(config.sessions)) {
      if (session.adapter === 'jet-browser') {
        try { await access(session.module, constants.R_OK); checks.push({ name: `Jet module ${id}`, ok: true, detail: session.module }); }
        catch { checks.push({ name: `Jet module ${id}`, ok: false, detail: `Unreadable: ${session.module}` }); }
        checks.push({ name: `Jet credential ${id}`, ok: Boolean(process.env[session.apiKeyEnv]), detail: session.apiKeyEnv });
      } else if (session.adapter === 'jet-standalone') {
        if (session.cwd) {
          try { await access(session.cwd, constants.R_OK); checks.push({ name: `Jet working directory ${id}`, ok: true, detail: session.cwd }); }
          catch { checks.push({ name: `Jet working directory ${id}`, ok: false, detail: `Unreadable: ${session.cwd}` }); }
        }
        checks.push({
          name: `Jet executable ${id}`,
          ok: await executableAvailable(session.command, session.cwd),
          detail: `${session.command} ${session.args.join(' ')}`.trim()
        });
      } else {
        try {
          const { chromium } = await import('playwright');
          const browser = await chromium.connectOverCDP(session.endpoint, { timeout: 3_000 });
          await browser.close();
          checks.push({ name: `CDP connection ${id}`, ok: true, detail: session.endpoint });
        } catch (error) {
          checks.push({
            name: `CDP connection ${id}`,
            ok: false,
            detail: `${session.endpoint}: ${error instanceof Error ? error.message : String(error)}`
          });
        }
      }
    }
  } catch (error) {
    checks.push({ name: 'Configuration', ok: false, detail: error instanceof Error ? error.message : String(error) });
  }
  for (const check of checks) stdout.write(`${check.ok ? 'PASS' : 'FAIL'} ${check.name}: ${check.detail}\n`);
  if (checks.some(check => !check.ok)) process.exitCode = 1;
}

async function agentConfig(options: ReadonlyMap<string, string | true>): Promise<void> {
  const path = resolve(stringOption(options, 'config') ?? defaultConfigPath());
  await loadConfiguration(path);
  const agent = stringOption(options, 'agent') ?? 'codex';
  if (agent === 'codex') {
    stdout.write(`${codexCommand(path)}\n`);
    return;
  }
  if (agent === 'mcp-json') {
    stdout.write(`${JSON.stringify({ mcpServers: { 'rea-captcha': mcpLaunch(path) } }, null, 2)}\n`);
    return;
  }
  throw new Error('--agent must be codex or mcp-json.');
}

async function withRegistry<T>(
  options: ReadonlyMap<string, string | true>,
  run: (registry: ChallengeSessionRegistry) => Promise<T>,
  override?: ReaCaptchaConfiguration
): Promise<T> {
  const config = override ?? await loadConfiguration(stringOption(options, 'config') ?? defaultConfigPath());
  const registry = new ChallengeSessionRegistry(config);
  const shutdown = async () => registry.close();
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  try { return await run(registry); }
  finally {
    process.removeListener('SIGINT', shutdown);
    process.removeListener('SIGTERM', shutdown);
    await registry.close();
  }
}

async function inspect(options: ReadonlyMap<string, string | true>): Promise<void> {
  const session = stringOption(options, 'session');
  if (!session) throw new Error('inspect requires --session <id>.');
  await withRegistry(options, async registry => {
    const controller = await registry.get(session);
    stdout.write(`${JSON.stringify(await controller.inspect(), null, 2)}\n`);
  });
}

const help = `rea-captcha — local verification challenge intelligence for browser agents

Usage:
  rea-captcha setup [--preset chrome-cdp|empty] [--session ID] [--endpoint URL] [--config PATH] [--yes]
  rea-captcha doctor [--config PATH]
  rea-captcha agent-config [--agent codex|mcp-json] [--config PATH]
  rea-captcha inspect --session ID [--config PATH]
  rea-captcha mcp --stateless
  rea-captcha mcp [--config PATH]
`;

export async function runCli(argv = process.argv.slice(2)): Promise<void> {
  const parsed = parseArguments(argv);
  if (parsed.command === 'setup') return setup(parsed.options);
  if (parsed.command === 'doctor') return doctor(parsed.options);
  if (parsed.command === 'agent-config') return agentConfig(parsed.options);
  if (parsed.command === 'inspect') return inspect(parsed.options);
  if (parsed.command === 'mcp') {
    const stateless = parsed.options.get('stateless') === true;
    if (parsed.options.has('stateless') && !stateless) throw new Error('--stateless does not take a value.');
    if (stateless && parsed.options.has('config')) throw new Error('--stateless cannot be combined with --config.');
    await withRegistry(parsed.options, async registry => {
      const server = await runStdioMcpServer(registry);
      await new Promise<void>(resolve => {
        const done = () => resolve();
        process.once('SIGINT', done);
        process.once('SIGTERM', done);
        server.server.onclose = done;
      });
      await server.close();
    }, stateless ? emptyConfiguration : undefined);
    return;
  }
  stdout.write(help);
}
