import { promisify } from 'util';
import { execFile as _execFile } from 'child_process';
import type { SandboxContext, ExecOptions, ExecResult } from '../types';
import { SandboxProvider } from '../SandboxProvider';
import { SandboxProvisionError, SandboxExecTimeoutError, SandboxDestroyError } from '../errors';

const execFile = promisify(_execFile);

export interface DockerDriverConfig {
  image?: string;
  memoryMb?: number; // in MB
  cpuCount?: number;
  workdir?: string;
}

export class DockerDriver extends SandboxProvider {
  private config: Required<DockerDriverConfig>;
  private containerId?: string;

  constructor(cfg: DockerDriverConfig = {}) {
    super();
    this.config = {
      image: 'ghcr.io/devs-project/sandbox-base:alpine-3.19',
      memoryMb: 4096,
      cpuCount: 2,
      workdir: '/workspace',
      ...cfg,
    } as Required<DockerDriverConfig>;
  }

  private memoryFlag(): string {
    const mb = this.config.memoryMb;
    if (mb % 1024 === 0) return `${mb / 1024}g`;
    return `${mb}m`;
  }

  /**
   * provision: runs a docker container with hardened flags.
   * Flags rationale:
   *  --cap-drop=ALL: prevents privilege escalation; satisfies security design.
   *  --security-opt=no-new-privileges: disallow new privileges from binaries.
   *  --read-only: reduce attack surface on filesystem.
   *  --network=none: default to no network access.
   */
  async provision(): Promise<SandboxContext> {
    try {
      const memFlag = this.memoryFlag();
      const args = [
        'run',
        '-d',
        '--cap-drop=ALL', // prevents privilege escalation; satisfies [5_SECURITY_DESIGN-REQ-SEC-SD-045]
        '--security-opt=no-new-privileges',
        '--read-only',
        '--network=none',
        `--memory=${memFlag}`,
        `--cpus=${this.config.cpuCount}`,
        '--rm',
        '-w',
        this.config.workdir,
        this.config.image,
        'sleep',
        'infinity',
      ];

      const { stdout, stderr } = await execFile('docker', args as any);
      const id = (stdout ?? '').toString().trim();
      if (!id) {
        throw new SandboxProvisionError(`docker run did not return a container id. stderr: ${stderr}`);
      }
      this.containerId = id;
      return { id, workdir: this.config.workdir, status: 'running', createdAt: new Date() };
    } catch (err: any) {
      throw new SandboxProvisionError(err?.message ?? String(err));
    }
  }

  async exec(ctx: SandboxContext, cmd: string, args: string[], opts?: ExecOptions): Promise<ExecResult> {
    const id = ctx.id ?? this.containerId;
    if (!id) throw new Error('No container id available for exec');
    const start = Date.now();
    try {
      const execPromise = execFile('docker', ['exec', id, cmd, ...args] as any, { env: opts?.env, cwd: opts?.cwd }) as Promise<{ stdout: string; stderr: string }>;

      if (opts?.timeoutMs) {
        const timeoutMs = opts.timeoutMs;
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new SandboxExecTimeoutError(timeoutMs)), timeoutMs);
        });
        const res = await Promise.race([execPromise, timeoutPromise]);
        const duration = Date.now() - start;
        return { stdout: (res as any).stdout ?? '', stderr: (res as any).stderr ?? '', exitCode: 0, durationMs: duration };
      } else {
        const res = await execPromise;
        const duration = Date.now() - start;
        return { stdout: res.stdout ?? '', stderr: res.stderr ?? '', exitCode: 0, durationMs: duration };
      }
    } catch (err: any) {
      if (err instanceof SandboxExecTimeoutError) throw err;
      throw new Error(err?.message ?? String(err));
    }
  }

  async destroy(ctx: SandboxContext): Promise<void> {
    const id = ctx.id ?? this.containerId;
    if (!id) return;
    try {
      await execFile('docker', ['rm', '-f', id] as any);
      ctx.status = 'stopped';
    } catch (err: any) {
      throw new SandboxDestroyError(err?.message ?? String(err));
    }
  }
}
