import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createInterface, type Interface } from 'node:readline';

export interface OcrRequest {
  readonly imageBase64: string;
  readonly options?: Readonly<Record<string, boolean | number | string>>;
}

export interface OcrResult {
  readonly text: string;
  readonly confidence: number | null;
  readonly engine: string;
}

interface Pending {
  resolve(value: OcrResult): void;
  reject(error: Error): void;
  timer: NodeJS.Timeout;
}

export class PythonOcrRuntime {
  readonly #command: string;
  readonly #args: readonly string[];
  readonly #timeoutMs: number;
  #process: ChildProcessWithoutNullStreams | null = null;
  #lines: Interface | null = null;
  #nextId = 1;
  #pending = new Map<number, Pending>();

  constructor({
    command = 'python3',
    args = ['-m', 'rea_captcha.ocr_worker'],
    timeoutMs = 30_000
  }: { command?: string; args?: readonly string[]; timeoutMs?: number } = {}) {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 300_000) {
      throw new Error('timeoutMs must be an integer from 100 to 300000.');
    }
    this.#command = command;
    this.#args = args;
    this.#timeoutMs = timeoutMs;
  }

  async recognize(request: OcrRequest, signal?: AbortSignal): Promise<OcrResult> {
    if (!request.imageBase64) throw new Error('imageBase64 is required.');
    if (signal?.aborted) throw signal.reason ?? new Error('Aborted');
    const encoded = `${JSON.stringify({ id: this.#nextId, ...request })}\n`;
    if (Buffer.byteLength(encoded) > 16 * 1024 * 1024) throw new Error('Local OCR request exceeds 16 MiB.');
    this.#ensureStarted();
    const id = this.#nextId++;
    return new Promise<OcrResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        const pending = this.#pending.get(id);
        if (!pending) return;
        this.#pending.delete(id);
        pending.reject(new Error(`Local OCR timed out after ${this.#timeoutMs} ms.`));
      }, this.#timeoutMs);
      const abort = () => {
        const pending = this.#pending.get(id);
        if (!pending) return;
        clearTimeout(pending.timer);
        this.#pending.delete(id);
        reject(signal?.reason ?? new Error('Aborted'));
      };
      signal?.addEventListener('abort', abort, { once: true });
      this.#pending.set(id, {
        resolve: value => { signal?.removeEventListener('abort', abort); resolve(value); },
        reject: error => { signal?.removeEventListener('abort', abort); reject(error); },
        timer
      });
      this.#process?.stdin.write(encoded, error => {
        if (!error) return;
        const pending = this.#pending.get(id);
        if (!pending) return;
        clearTimeout(pending.timer);
        this.#pending.delete(id);
        pending.reject(error);
      });
    });
  }

  async close(): Promise<void> {
    const process = this.#process;
    this.#process = null;
    this.#lines?.close();
    this.#lines = null;
    if (!process) return;
    this.#failPending(new Error('Local OCR runtime closed.'));
    process.stdin.end();
    await new Promise<void>(resolve => {
      const timer = setTimeout(() => { process.kill('SIGTERM'); resolve(); }, 2_000);
      process.once('exit', () => { clearTimeout(timer); resolve(); });
    });
  }

  #ensureStarted(): void {
    if (this.#process) return;
    const child = spawn(this.#command, [...this.#args], { stdio: ['pipe', 'pipe', 'pipe'] });
    this.#process = child;
    this.#lines = createInterface({ input: child.stdout });
    this.#lines.on('line', line => this.#handleLine(line));
    child.stderr.on('data', chunk => {
      const message = String(chunk).trim();
      if (message) process.stderr.write(`[rea-captcha OCR] ${message}\n`);
    });
    child.once('error', error => {
      this.#failPending(error);
      if (this.#process === child) this.#process = null;
      this.#lines = null;
    });
    child.once('exit', (code, signal) => {
      this.#failPending(new Error(`Local OCR process exited (${code ?? signal ?? 'unknown'}).`));
      this.#process = null;
      this.#lines = null;
    });
  }

  #handleLine(line: string): void {
    if (Buffer.byteLength(line) > 1024 * 1024) {
      this.#failPending(new Error('Local OCR response exceeds 1 MiB.'));
      this.#process?.kill('SIGTERM');
      return;
    }
    let response: Record<string, unknown>;
    try { response = JSON.parse(line) as Record<string, unknown>; }
    catch {
      this.#failPending(new Error('Local OCR returned invalid JSON.'));
      this.#process?.kill('SIGTERM');
      return;
    }
    const id = response.id;
    if (!Number.isInteger(id)) return;
    const pending = this.#pending.get(id as number);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.#pending.delete(id as number);
    if (typeof response.error === 'string') {
      pending.reject(new Error(response.error));
      return;
    }
    if (typeof response.text !== 'string' || typeof response.engine !== 'string') {
      pending.reject(new Error('Local OCR returned an invalid response.'));
      return;
    }
    pending.resolve({
      text: response.text,
      confidence: typeof response.confidence === 'number' ? response.confidence : null,
      engine: response.engine
    });
  }

  #failPending(error: Error): void {
    for (const pending of this.#pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.#pending.clear();
  }
}
