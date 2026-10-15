import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, '.agents', 'skills', 'rea-captcha');
const destinations = [
  resolve(root, 'skills', 'rea-captcha'),
  resolve(root, 'integrations', 'hermes', 'skills', 'rea-captcha')
];
for (const destination of destinations) {
  await rm(destination, { recursive: true, force: true });
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}
