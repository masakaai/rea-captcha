import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createInterface, type Interface } from 'node:readline';
import type { BrowserChallengePort } from '../application/ports.js';
import type { ChallengeObservation } from '../domain/challenge.js';
import { browserObservationExpression } from '../detector/browser-expression.js';
import { parseObservation } from './observation.js';

interface Waiter {
  readonly op: string;
  readonly resolve: (value: unknown) => void;
  readonly reject: (error: Error) => void;
  readonly timer: NodeJS.Timeout;
}

export interface JetStandaloneOptions {
  readonly id: string;
  readonly command: string;
  readonly args?: readonly string[];
  readonly cwd?: string;
  readonly commandTimeoutMs?: number;
  readonly sessionTimeoutMs?: number;
  readonly create?: Readonly<Record<string, unknown>>;
}

const unwrapEvaluation = (value: unknown): unknown => {
  if (!value || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  if (record.result && typeof record.result === 'object' && 'value' in record.result) {
    return (record.result as Record<string, unknown>).value;
  }
  if ('value' in record) return record.value;
  return value;
};

export class JetStandaloneChallengeAdapter implements BrowserChallengePort {
  readonly id: string;
  readonly #child: ChildProcessWithoutNullStreams;
  readonly #lines: Interface;
  readonly #commandTimeoutMs: number;
  readonly #waiters: Waiter[] = [];
  #stderr = '';
  #stdoutBytes = 0;
  #closed = false;
  #sessionTimer: NodeJS.Timeout;

  private constructor(options: JetStandaloneOptions) {
    if (!options.id) throw new Error('Jet standalone id is required.');
    if (!options.command) throw new Error('Jet standalone command is required.');
    this.id = options.id;
    this.#commandTimeoutMs = options.commandTimeoutMs ?? 30_000;
    this.#child = spawn(options.command, [...(options.args ?? [])], {
      ...(options.cwd ? { cwd: options.cwd } : {}),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    this.#lines = createInterface({ input: this.#child.stdout });
    this.#lines.on('line', line => this.#handleLine(line));
    this.#child.stderr.on('data', chunk => { this.#stderr = `${this.#stderr}${String(chunk)}`.slice(-4_000); });
    this.#child.once('error', error => this.#fail(error));
    this.#child.once('exit', (code, signal) => {
      if (!this.#closed || this.#waiters.length) {
        this.#fail(new Error(`Jet standalone process exited (${code ?? signal ?? 'unknown'}).${this.#stderr ? ` ${this.#stderr.trim()}` : ''}`));
      }
    });
    this.#sessionTimer = setTimeout(() => {
      this.#fail(new Error(`Jet standalone session exceeded ${options.sessionTimeoutMs ?? 300_000} ms.`));
      this.#child.kill('SIGTERM');
    }, options.sessionTimeoutMs ?? 300_000);
  }

  static async launch(options: JetStandaloneOptions): Promise<JetStandaloneChallengeAdapter> {
    const adapter = new JetStandaloneChallengeAdapter(options);
    try {
      await adapter.#send({
        op: 'create',
        proxy: null,
        profile_dir: null,
        page_load_strategy: 'none',
        ...(options.create ?? {})
      });
      return adapter;
    } catch (error) {
      await adapter.close().catch(() => {});
      throw error;
    }
  }

  async observe(signal?: AbortSignal): Promise<ChallengeObservation> {
    if (signal?.aborted) throw signal.reason ?? new Error('Aborted');
    const abort = () => {
      this.#fail(signal?.reason instanceof Error ? signal.reason : new Error('Aborted'));
      this.#child.kill('SIGTERM');
    };
    signal?.addEventListener('abort', abort, { once: true });
    try {
      const evaluation = await this.#send({ op: 'evaluate', expression: browserObservationExpression });
      return parseObservation(unwrapEvaluation(evaluation));
    } finally {
      signal?.removeEventListener('abort', abort);
    }
  }

  async close(): Promise<void> {
    if (this.#closed) return;
    this.#closed = true;
    clearTimeout(this.#sessionTimer);
    try { await this.#send({ op: 'close' }); }
    catch { /* Closing remains best-effort; EOF still releases the WPE resource. */ }
    this.#child.stdin.end();
    await new Promise<void>(resolve => {
      if (this.#child.exitCode !== null || this.#child.signalCode !== null) return resolve();
      const timer = setTimeout(() => { this.#child.kill('SIGTERM'); resolve(); }, 2_000);
      this.#child.once('exit', () => { clearTimeout(timer); resolve(); });
    });
    this.#lines.close();
  }

  #send(command: Readonly<Record<string, unknown>>): Promise<unknown> {
    if (this.#closed && command.op !== 'close') return Promise.reject(new Error('Jet standalone session is closed.'));
    const line = `${JSON.stringify(command)}\n`;
    if (Buffer.byteLength(line) > 1_048_576) return Promise.reject(new Error('Jet standalone command exceeds 1 MiB.'));
    return new Promise((resolve, reject) => {
      const op = typeof command.op === 'string' ? command.op : 'unknown';
      const timer = setTimeout(() => {
        const error = new Error(`${op}: Jet standalone response timed out after ${this.#commandTimeoutMs} ms.`);
        this.#fail(error);
        this.#child.kill('SIGTERM');
      }, this.#commandTimeoutMs);
      this.#waiters.push({ op, resolve, reject, timer });
      this.#child.stdin.write(line, error => {
        if (!error) return;
        this.#fail(error);
        this.#child.kill('SIGTERM');
      });
    });
  }

  #handleLine(line: string): void {
    this.#stdoutBytes += Buffer.byteLength(line) + 1;
    if (this.#stdoutBytes > 24 * 1024 * 1024) {
      this.#fail(new Error('Jet standalone output exceeded 24 MiB.'));
      this.#child.kill('SIGTERM');
      return;
    }
    if (!line) return;
    const waiter = this.#waiters.shift();
    if (!waiter) {
      this.#fail(new Error('Jet standalone returned an unexpected response.'));
      this.#child.kill('SIGTERM');
      return;
    }
    clearTimeout(waiter.timer);
    let response: unknown;
    try { response = JSON.parse(line) as unknown; }
    catch {
      waiter.reject(new Error(`${waiter.op}: Jet standalone returned invalid JSON.`));
      this.#fail(new Error('Jet standalone protocol became unsynchronized.'));
      this.#child.kill('SIGTERM');
      return;
    }
    if (!response || typeof response !== 'object' || typeof (response as Record<string, unknown>).ok !== 'boolean') {
      waiter.reject(new Error(`${waiter.op}: Jet standalone returned an invalid response envelope.`));
      this.#fail(new Error('Jet standalone protocol became unsynchronized.'));
      this.#child.kill('SIGTERM');
      return;
    }
    const envelope = response as Record<string, unknown>;
    if (envelope.ok) waiter.resolve(envelope.value);
    else waiter.reject(new Error(`${waiter.op}: ${typeof envelope.error === 'string' ? envelope.error : 'Browser command failed.'}`));
  }

  #fail(error: Error): void {
    for (const waiter of this.#waiters.splice(0)) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
  }
}
