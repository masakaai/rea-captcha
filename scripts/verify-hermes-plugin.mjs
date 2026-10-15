import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const integration = resolve(root, 'integrations', 'hermes');
const readJson = async name => JSON.parse(await readFile(resolve(integration, name), 'utf8'));

const [packageJson, plugin, mcp, sourceSkill, packagedSkill] = await Promise.all([
  JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8')),
  readJson('plugin.json'),
  readJson('mcp.json'),
  readFile(resolve(root, '.agents', 'skills', 'rea-captcha', 'SKILL.md'), 'utf8'),
  readFile(resolve(integration, 'skills', 'rea-captcha', 'SKILL.md'), 'utf8')
]);

assert.equal(plugin.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
assert.equal(plugin.name, 'rea-captcha');
assert.equal(plugin.version, packageJson.version, 'Hermes plugin version must match the published npm package.');
assert.equal(mcp.$schema, 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json');
assert.deepEqual(mcp.mcpServers['rea-captcha'], {
  type: 'stdio',
  command: 'npx',
  args: ['-y', `rea-captcha@${packageJson.version}`, 'mcp', '--stateless']
});
assert.equal(packagedSkill, sourceSkill, 'Hermes skill must be regenerated from .agents/skills/rea-captcha.');
await Promise.all(['README.md', 'LICENSE'].map(name => access(resolve(integration, name), constants.R_OK)));

process.stdout.write(`Verified Hermes Agent Plugin v1 package for rea-captcha ${packageJson.version}.\n`);
