import { promisify } from 'util';
import { execFile as _execFile } from 'child_process';
import type { SandboxContext, ExecOptions, ExecResult, SandboxConfig } from '../types';
import { SandboxProvider } from '../SandboxProvider';
import { SandboxProvisionError, SandboxExecTimeoutError, SandboxDestroyError, ConfigValidationError, MissingResourceConfigError } from '../errors';
import { DockerNetworkManager } from '../network/DockerNetworkManager';
import { isIP } from 'net';
import { withExecutionTimeout, ExecutionTimeoutError, DEFAULT_TOOL_CALL_TIMEOUT_MS } from '../utils/execution-timeout';

const execFile = promisify(_execFile);

export function buildDockerRunArgs(config: SandboxConfig): string[] {
  if (!config || typeof config.cpuCores !== 'number' || config.cpuCores <= 0) {
    throw new MissingResourceConfigError('cpuCores', 'cpuCores must be a positive number');
  }
  if (!config || typeof config.memoryGb !== 'number' || config.memoryGb <= 0) {
    throw new MissingResourceConfigError('memoryGb', 'memoryGb must be a positive number');
  }
  const pidLimit = config.pidLimit ?? 512;
  const nofile = config.nofileLimit ?? 1024;
  return [
    `--cpus=${config.cpuCores}`,
    `--memory=${config.memoryGb}g`,
    `--memory-swap=${config.memoryGb}g`,
    `--pids-limit=${pidLimit}`,
    '--ulimit',
    `nofile=${nofile}:${nofile}`,
  ];
}

export function buildVolumeArgs(config: SandboxConfig): string[] {
  if (!config || typeof config.storageLimitGb !== 'number' || config.storageLimitGb <= 0) {
    throw new MissingResourceConfigError('storageLimitGb', 'storageLimitGb must be a positive number');
  }
  const tmpfsMount = `type=tmpfs,destination=/tmp,tmpfs-size=${config.tmpfsSize ?? '256m'}`;
  return ['--storage-opt', `size=${config.storageLimitGb}g`, '--mount', tmpfsMount];
}

export interface DockerDriverConfig {
  image?: string;
  memoryMb?: number; // in MB
  cpuCount?: number;
  workdir?: string;
  egressProxyIp?: string; // optional orchestrator proxy IP
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

  static buildRunArgs(config: SandboxConfig): string[] {
    if (!config?.hostProjectPath) throw new Error('hostProjectPath is required');
    if (config.hostProjectPath.endsWith('.git') || config.hostProjectPath.endsWith('.devs')) {
      throw new Error('hostProjectPath must not end with .git or .devs');
    }
    const workspaceMount = config.workspaceMount ?? '/workspace';
    const tmpfsSize = config.tmpfsSize ?? '256m';
    // --read-only: enforces 5_SECURITY_DESIGN-REQ-SEC-SD-047
    const args: string[] = [
      'run',
      '-d',
      '--cap-drop=ALL', // prevents privilege escalation
      '--security-opt=no-new-privileges',
      '--read-only',
      '--network=none',
      '--tmpfs',
      `/tmp:rw,noexec,nosuid,nodev,size=${tmpfsSize}`,
      '--tmpfs',
      `/run:rw,noexec,nosuid,nodev,size=64m`,
    ];

    // Merge in volume-specific args (storage-opt, mount) when available
    try {
      const volumeArgs = buildVolumeArgs(config);
      args.push(...volumeArgs);
    } catch (e) {
      // if storageLimitGb isn't provided, do not fail here; higher-level validation should enforce it
    }

    args.push(
      '-w',
      workspaceMount,
      '-v',
      `${config.hostProjectPath}:${workspaceMount}:ro`,
      'sleep',
      'infinity',
    );
    return args;
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
      const resourceArgs = buildDockerRunArgs({ hostProjectPath: this.config.workdir, cpuCores: this.config.cpuCount, memoryGb: Math.round(this.config.memoryMb / 1024) });
      const args = [
        'run',
        '-d',
        '--cap-drop=ALL', // prevents privilege escalation; satisfies [5_SECURITY_DESIGN-REQ-SEC-SD-045]
        '--security-opt=no-new-privileges',
        '--read-only',
        '--network=none',
        ...resourceArgs,
        '--rm',
        '-w',
        this.config.workdir,
        // image will be inserted later
      ];

      // Insert proxy/network options when configured
      let networkId: string | undefined;
      if (this.config.egressProxyIp) {
        if (!isIP(this.config.egressProxyIp)) {
          throw new ConfigValidationError('egressProxyIp must be a valid IP address');
        }
        const sandboxId = `devs-sandbox-${Math.random().toString(36).slice(2, 8)}`;
        networkId = await DockerNetworkManager.createIsolatedNetwork(sandboxId);
        // replace --network=none with the created network
        const nwIdx = args.findIndex(a => a.startsWith('--network'));
        if (nwIdx !== -1) args[nwIdx] = `--network=${networkId}`;
        // DNS and proxy envs will be added before the image
      }

      // image and command
      args.push(this.config.image, 'sleep', 'infinity');

      // If proxy options exist, insert env and dns flags before image
      if (networkId && this.config.egressProxyIp) {
        const proxyIp = this.config.egressProxyIp;
        // find the index of the image in args
        const imgIdx = args.indexOf(this.config.image);
        const proxyFlags = [
          '--dns', proxyIp,
          '-e', `HTTP_PROXY=http://${proxyIp}:3128`,
          '-e', `HTTPS_PROXY=http://${proxyIp}:3128`,
          '-e', `NO_PROXY=`,
        ];
        if (imgIdx !== -1) args.splice(imgIdx, 0, ...proxyFlags);
      }

      const { stdout, stderr } = await execFile('docker', args as any);
      const id = (stdout ?? '').toString().trim();
      if (!id) {
        throw new SandboxProvisionError(`docker run did not return a container id. stderr: ${stderr}`);
      }
      this.containerId = id;
      return { id, workdir: this.config.workdir, status: 'running', createdAt: new Date(), networkId };
    } catch (err: any) {
      throw new SandboxProvisionError(err?.message ?? String(err));
    }
  }

  async exec(ctx: SandboxContext, cmd: string, args: string[], opts?: ExecOptions): Promise<ExecResult> {
    const id = ctx.id ?? this.containerId;
    if (!id) throw new Error('No container id available for exec');
    const start = Date.now();
    try {
      const res = await withExecutionTimeout(
        () => execFile('docker', ['exec', id, cmd, ...args] as any, { env: opts?.env, cwd: opts?.cwd }) as Promise<{ stdout: string; stderr: string }> ,
        opts?.timeoutMs ?? DEFAULT_TOOL_CALL_TIMEOUT_MS
      );
      const duration = Date.now() - start;
      return { stdout: (res as any).stdout ?? '', stderr: (res as any).stderr ?? '', exitCode: 0, durationMs: duration };
    } catch (err: any) {
      if (err instanceof ExecutionTimeoutError) {
        try {
          await this.forceStop(id);
        } catch (e) {
          // ignore force stop errors
        }
        throw err;
      }
      if (err instanceof SandboxExecTimeoutError) throw err;
      throw new Error(err?.message ?? String(err));
    }
  }

  private async forceStop(containerId?: string): Promise<void> {
    const id = containerId ?? this.containerId;
    if (!id) return;
    try {
      await execFile('docker', ['stop', '--time=0', id] as any, {});
    } catch (e) {
      // ignore
    }
  }

  async destroy(ctx: SandboxContext): Promise<void> {
    const id = ctx.id ?? this.containerId;
    if (!id) return;
    try {
      try {
        await execFile('docker', ['rm', '-f', id] as any);
        ctx.status = 'stopped';
      } finally {
        if (ctx.networkId) {
          try {
            await DockerNetworkManager.removeNetwork(ctx.networkId);
          } catch (e) {
            // ignore network removal errors
          }
        }
      }
    } catch (err: any) {
      throw new SandboxDestroyError(err?.message ?? String(err));
    }
  }
}
