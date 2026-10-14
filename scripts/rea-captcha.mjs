#!/usr/bin/env node
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = resolve(root, 'dist', 'main.js');
try { await access(entry, constants.R_OK); }
catch { throw new Error('rea-captcha is not built. Run npm run build first.'); }
await import(pathToFileURL(entry).href);
