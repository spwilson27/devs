import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { ResourceExhaustionHandler } from './handlers/resource-exhaustion-handler';

export class SandboxManager extends EventEmitter {
  private proc?: ChildProcess;
  private stopped = false;
  private retryCount = 0;
  private readonly maxRetries = 3;
  private readonly baseBackoffMs = 1000;
  private readonly handler: ResourceExhaustionHandler;

  constructor(handler: ResourceExhaustionHandler) {
    super();
    this.handler = handler;
  }

  start() {
    if (this.proc || this.stopped) return;
    this.spawnEventsProcess();
  }

  private spawnEventsProcess() {
    const args = ['events', '--filter', 'event=oom', '--format', "{{.ID}}"];
    try {
      const child = spawn('docker', args);
      this.proc = child;
      this.retryCount = 0;

      // Listen for docker events stdout
      if ((child as any).stdout && typeof (child as any).stdout.on === 'function') {
        (child as any).stdout.on('data', (chunk: Buffer | string) => {
          const s = chunk.toString().trim();
          if (!s) return;
          for (const line of s.split(/\r?\n/)) {
            const id = line.trim();
            if (!id) continue;
            // fire-and-forget to avoid blocking the event loop
            void this.handler.onOomKill(id);
            this.emit('oom', id);
          }
        });
      }

      child.on('error', () => this.scheduleRestart());
      child.on('close', () => this.scheduleRestart());
    } catch (err) {
      this.scheduleRestart();
    }
  }

  private scheduleRestart() {
    if (this.stopped) return;
    this.retryCount++;
    if (this.retryCount > this.maxRetries) {
      this.emit('failed', { retries: this.retryCount });
      return;
    }
    const delay = Math.min(30000, this.baseBackoffMs * Math.pow(2, this.retryCount - 1));
    setTimeout(() => {
      if (this.stopped) return;
      this.spawnEventsProcess();
    }, delay);
  }

  stop() {
    this.stopped = true;
    if (this.proc) {
      try {
        this.proc.kill();
      } catch (e) {
        // ignore
      }
      this.proc = undefined;
    }
    this.emit('stopped');
  }
}
