import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { ChallengeEvent, ChallengeEventSink } from './ports.js';

export class JsonlChallengeEventSink implements ChallengeEventSink {
  readonly path: string;
  #pending: Promise<void> = Promise.resolve();

  constructor(path: string) {
    this.path = resolve(path);
  }

  write(event: ChallengeEvent): Promise<void> {
    const line = `${JSON.stringify(event)}\n`;
    this.#pending = this.#pending.then(async () => {
      await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
      await appendFile(this.path, line, { encoding: 'utf8', mode: 0o600 });
    });
    return this.#pending;
  }
}

export class MemoryChallengeEventSink implements ChallengeEventSink {
  readonly events: ChallengeEvent[] = [];
  write(event: ChallengeEvent): void { this.events.push(event); }
}
