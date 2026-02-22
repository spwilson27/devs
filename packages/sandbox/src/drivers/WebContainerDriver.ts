import type { SandboxContext, ExecOptions, ExecResult } from '../types';
import { SandboxProvider } from '../SandboxProvider';
import { SandboxProvisionError, SandboxExecTimeoutError, SandboxDestroyError, SandboxExecError } from '../errors';
import { WebContainerPackageInstaller } from './webcontainer/package-installer';
import type { PackageInstallResult } from './webcontainer/package-installer';
import { NativeDependencyChecker } from './webcontainer/native-dependency-checker';

export interface WebContainerDriverConfig {
  workdir?: string;
}

export const isWebContainerSupported = (): boolean =>
  typeof window !== 'undefined' && 'crossOriginIsolated' in window && (window as any).crossOriginIsolated;

export class WebContainerDriver extends SandboxProvider {
  private wc: any | null = null;
  private context: SandboxContext | null = null;
  private config: Required<WebContainerDriverConfig>;

  constructor(cfg: WebContainerDriverConfig = {}) {
    super();
    this.config = { workdir: '/workspace', ...cfg } as Required<WebContainerDriverConfig>;
  }

  async provision(): Promise<SandboxContext> {
    if (this.context) return this.context;
    try {
      const mod = await import('@webcontainer/api');
      const WebContainer = (mod as any).WebContainer ?? (mod as any).default ?? mod;
      this.wc = await WebContainer.boot();
      try {
        if (this.wc?.fs?.mkdir) {
          await this.wc.fs.mkdir(this.config.workdir, { recursive: true });
        }
      } catch (err) {
        // ignore fs creation errors
      }
      const id = `webcontainer-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      this.context = { id, workdir: this.config.workdir, status: 'running', createdAt: new Date() };
      return this.context;
    } catch (err: any) {
      throw new SandboxProvisionError(err?.message ?? String(err));
    }
  }

  async installPackages(packages: string[]): Promise<PackageInstallResult> {
    if (!this.wc) throw new SandboxExecError('WebContainer not provisioned');
    const installer = new WebContainerPackageInstaller(this.wc, new NativeDependencyChecker());
    return installer.install(packages);
  }

  async exec(ctx: SandboxContext, cmd: string, args: string[] = [], opts?: ExecOptions): Promise<ExecResult> {
    if (!this.wc) throw new SandboxExecError('WebContainer not provisioned');
    const start = Date.now();
    const proc = typeof this.wc.spawn === 'function' ? this.wc.spawn(cmd, args, { cwd: opts?.cwd ?? ctx.workdir }) : null;
    if (!proc) {
      throw new SandboxExecError('spawn not supported by this WebContainer instance');
    }

    const exitPromise: Promise<number> =
      proc.exit instanceof Promise ? proc.exit : typeof proc.exit === 'function' ? proc.exit() : Promise.resolve(0);

    const timeoutMs = opts?.timeoutMs;
    const race = timeoutMs
      ? Promise.race([exitPromise, new Promise<never>((_, reject) => setTimeout(() => reject(new SandboxExecTimeoutError(timeoutMs)), timeoutMs))])
      : exitPromise;

    try {
      const exitCode = (await race) as number;

      let stdout = '';
      let stderr = '';

      if (typeof proc.getOutput === 'function') {
        try {
          stdout = await proc.getOutput();
        } catch (e) {
          // ignore
        }
      } else if (typeof proc.stdout === 'string') {
        stdout = proc.stdout;
      } else if (typeof proc.output === 'string') {
        stdout = proc.output;
      } else if (typeof proc.readAll === 'function') {
        try {
          stdout = await proc.readAll();
        } catch (e) {}
      }

      const duration = Date.now() - start;

      if (exitCode !== 0) {
        throw new SandboxExecError(`Process exited with code ${exitCode}`);
      }

      return { stdout: stdout ?? '', stderr: stderr ?? '', exitCode: exitCode ?? 0, durationMs: duration };
    } catch (err: any) {
      if (err instanceof SandboxExecTimeoutError) throw err;
      if (err instanceof SandboxExecError) throw err;
      throw new SandboxExecError(err?.message ?? String(err));
    }
  }

  async destroy(ctx: SandboxContext): Promise<void> {
    try {
      if (this.wc && typeof this.wc.teardown === 'function') {
        await this.wc.teardown();
      }
      ctx.status = 'stopped';
      this.wc = null;
      this.context = null;
    } catch (err: any) {
      throw new SandboxDestroyError(err?.message ?? String(err));
    }
  }
}
