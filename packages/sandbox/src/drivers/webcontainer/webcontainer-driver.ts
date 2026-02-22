import { Readable } from 'stream';
import { SandboxProvider } from '../../SandboxProvider';
import type { SandboxContext, ExecOptions, ExecResult } from '../../types';
import { WebContainer } from '@webcontainer/api';
import {
  SandboxBootError,
  SandboxExecError,
  SandboxTimeoutError,
  SandboxNotBootedError,
  SandboxTeardownError,
  UnsupportedRuntimeError,
} from './errors';
import { RuntimeCompatibilityChecker } from './runtime-compat-checker';

export interface WebContainerDriverOptions {
  /** Timeout in milliseconds. Default: 300000 (5 minutes). */
  defaultTimeoutMs?: number; // default 300_000 (5 min)
  /** Working directory path inside the webcontainer. Default: '/workspace' */
  workdirPath?: string; // default '/workspace'
}

export class WebContainerDriver extends SandboxProvider {
  private _wc: any | null = null;
  private _booted = false;
  private _options: Required<WebContainerDriverOptions>;

  constructor(opts: WebContainerDriverOptions = {}) {
    super();
    this._options = {
      defaultTimeoutMs: 300_000,
      workdirPath: '/workspace',
      ...opts,
    };
  }

  async boot(): Promise<void> {
    try {
      this._wc = await (WebContainer as any).boot();
      this._booted = true;
    } catch (err: any) {
      throw new SandboxBootError(err?.message ?? String(err));
    }
  }

  async provision(): Promise<SandboxContext> {
    await this.boot();
    const id = `webcontainer-${Date.now()}`;
    return { id, workdir: this._options.workdirPath, status: 'running', createdAt: new Date() };
  }

  private async readToString(stream: any): Promise<string> {
    if (!stream) return '';

    // Web ReadableStream
    if (typeof stream.getReader === 'function') {
      const reader = stream.getReader();
      let out = '';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        out += String(value);
      }
      return out;
    }

    // Node.js Readable stream
    if (typeof stream.on === 'function') {
      return new Promise((resolve, reject) => {
        let buf = '';
        stream.on('data', (chunk: any) => (buf += String(chunk)));
        stream.on('end', () => resolve(buf));
        stream.on('error', (err: any) => reject(err));
      });
    }

    // Async iterator (fallback)
    if (stream[Symbol.asyncIterator]) {
      let buf = '';
      for await (const chunk of stream) {
        buf += String(chunk);
      }
      return buf;
    }

    return String(stream ?? '');
  }

  async exec(ctx: SandboxContext, cmd: string, args: string[] = [], opts?: ExecOptions): Promise<ExecResult> {
    if (!this._booted || !this._wc) throw new SandboxNotBootedError();

    // Check runtime compatibility before attempting to spawn in the WebContainer
    const checker = new RuntimeCompatibilityChecker();
    if (!checker.isRuntimeSupported(cmd)) {
      const reason = checker.getUnsupportedReason(cmd) ?? 'Unsupported runtime for WebContainerDriver';
      throw new UnsupportedRuntimeError(cmd, reason);
    }

    let proc: any;
    try {
      proc = await this._wc.spawn(cmd, args);
    } catch (err: any) {
      throw new SandboxExecError(err?.message ?? String(err));
    }

    const timeoutMs = opts?.timeoutMs ?? this._options.defaultTimeoutMs;
    const timeoutSignal = typeof timeoutMs === 'number' && timeoutMs >= 0 ? AbortSignal.timeout(timeoutMs) : null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      if (timeoutSignal) {
        timeoutSignal.addEventListener(
          'abort',
          () => {
            try {
              if (proc?.kill) proc.kill();
            } catch (_) {
              // swallow
            }
            reject(new SandboxTimeoutError(timeoutMs));
          },
          { once: true }
        );
      }
    });

    try {
      const stdoutPromise = this.readToString(proc.stdout);
      const stderrPromise = this.readToString(proc.stderr);
      const exitPromise = (proc.exit ?? proc.exitCode ?? Promise.resolve(0)) as Promise<number>;

      const exitCode = await Promise.race([exitPromise, timeoutPromise]);

      // timeout handled by AbortSignal.timeout

      const stdout = await stdoutPromise;
      const stderr = await stderrPromise;

      return { stdout, stderr, exitCode: Number(exitCode), durationMs: 0 };
    } catch (err: any) {
      if (err instanceof SandboxTimeoutError) throw err;
      throw new SandboxExecError(err?.message ?? String(err));
    }
  }

  async destroy(ctx: SandboxContext): Promise<void> {
    if (!this._booted) return;
    try {
      await this._wc?.teardown();
      this._wc = null;
      this._booted = false;
    } catch (err: any) {
      throw new SandboxTeardownError(err?.message ?? String(err));
    }
  }
}

