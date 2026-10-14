import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const serverJson = JSON.parse(await readFile(new URL('../server.json', import.meta.url), 'utf8'));
const failures = [];

if (serverJson.name !== 'io.github.masakaai/rea-captcha') failures.push('Unexpected MCP Registry namespace.');
if (packageJson.mcpName !== serverJson.name) failures.push('package.json mcpName must match the MCP Registry namespace.');
if (serverJson.version !== packageJson.version) failures.push('server.json version must match package.json.');
if (serverJson.repository?.url !== 'https://github.com/masakaai/rea-captcha') failures.push('Unexpected repository URL.');

const registryPackage = serverJson.packages?.find(item => item.registryType === 'npm');
if (!registryPackage) failures.push('server.json must contain an npm package.');
else {
  if (registryPackage.identifier !== packageJson.name) failures.push('MCP npm identifier must match package.json name.');
  if (registryPackage.version !== packageJson.version) failures.push('MCP npm version must match package.json version.');
  const argumentsList = registryPackage.packageArguments?.map(item => item.value) ?? [];
  if (argumentsList.join(' ') !== 'mcp --stateless') failures.push('MCP package must launch the bounded stateless stdio entrypoint.');
}

if (process.argv.includes('--published')) {
  try {
    const { stdout } = await execFileAsync('npm', ['view', `${packageJson.name}@${packageJson.version}`, 'version', '--json'], {
      timeout: 30_000,
      maxBuffer: 1024 * 1024
    });
    if (JSON.parse(stdout) !== packageJson.version) failures.push('The exact npm version is not visible in the public registry.');
  } catch (error) {
    failures.push(`Unable to verify the public npm package: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Verified MCP Registry metadata for ${serverJson.name}@${serverJson.version}.\n`);
}
