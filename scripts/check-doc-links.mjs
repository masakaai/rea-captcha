import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const localizedReadmes = (await readdir(resolve(root, 'docs/readme')))
  .filter(name => name.endsWith('.md'))
  .sort()
  .map(name => `docs/readme/${name}`);
const documents = [
  'README.md',
  ...localizedReadmes,
  'CONTRIBUTING.md',
  'SECURITY.md',
  'DISCLAIMER.md',
  'MODEL_LICENSES.md',
  'THIRD_PARTY_NOTICES.md',
  'docs/architecture.md',
  'docs/cases.md',
  'docs/ecosystem.md',
  'docs/mcp-tools.md',
  'docs/releasing.md',
  'docs/validation.md',
  'examples/codex/README.md',
  'integrations/hermes/README.md'
];
const failures = [];
for (const relative of documents) {
  const path = resolve(root, relative);
  const content = await readFile(path, 'utf8');
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (!target || /^(?:https?:|mailto:|#)/.test(target)) continue;
    const local = resolve(dirname(path), decodeURIComponent(target.split('#')[0]));
    try { await access(local, constants.R_OK); }
    catch { failures.push(`${relative}: ${target}`); }
  }
}
if (failures.length) {
  process.stderr.write(`Broken local documentation links:\n${failures.join('\n')}\n`);
  process.exitCode = 1;
} else process.stdout.write(`Checked ${documents.length} documentation files.\n`);
