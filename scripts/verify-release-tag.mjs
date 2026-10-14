#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const tag = process.argv[2];
if (!tag) throw new Error('Expected a GitHub release tag argument.');
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const expected = `v${packageJson.version}`;
if (tag !== expected) throw new Error(`Release tag ${tag} does not match package version ${expected}.`);
process.stdout.write(`Release tag ${tag} matches ${packageJson.name}@${packageJson.version}.\n`);
