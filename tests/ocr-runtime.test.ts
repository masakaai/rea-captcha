import { describe, expect, it } from 'vitest';
import { PythonOcrRuntime } from '../src/model/python-ocr-runtime.js';

const worker = String.raw`
const readline = require('node:readline');
const lines = readline.createInterface({ input: process.stdin });
lines.on('line', line => {
  const request = JSON.parse(line);
  process.stdout.write(JSON.stringify({
    id: request.id, text: Buffer.from(request.imageBase64, 'base64').toString('utf8'),
    confidence: null, engine: 'fixture'
  }) + '\n');
});
`;

describe('local OCR process boundary', () => {
  it('correlates concurrent responses and closes its owned process', async () => {
    const runtime = new PythonOcrRuntime({ command: process.execPath, args: ['-e', worker], timeoutMs: 2_000 });
    try {
      const results = await Promise.all([
        runtime.recognize({ imageBase64: Buffer.from('first').toString('base64') }),
        runtime.recognize({ imageBase64: Buffer.from('second').toString('base64') })
      ]);
      expect(results.map(result => result.text)).toEqual(['first', 'second']);
      expect(results.every(result => result.engine === 'fixture')).toBe(true);
    } finally {
      await runtime.close();
    }
  });

  it('reports process startup failure without waiting for the request timeout', async () => {
    const runtime = new PythonOcrRuntime({
      command: '/rea-captcha/missing-python-runtime', timeoutMs: 2_000
    });
    const started = Date.now();
    await expect(runtime.recognize({ imageBase64: 'AA==' })).rejects.toThrow();
    expect(Date.now() - started).toBeLessThan(1_000);
    await runtime.close();
  });
});
