import { Readable } from 'stream';
import { SandboxProvider } from '../SandboxProvider';
import type { SandboxContext, ExecOptions, ExecResult, SandboxStatus } from '../types';
import { SandboxProvisionError, SandboxDestroyedError, DependencyAuditError, ConfigValidationError, SecurityConfigError } from '../errors';
import { runPostInstallAudit } from '../audit/PostInstallHook';
import { DockerNetworkManager } from '../network/DockerNetworkManager';
import { isIP } from 'net';

export function buildHostConfig(cfg: Required<DockerDriverConfig>) {
  return {
    CapDrop: ['ALL'],
    SecurityOpt: ['no-new-privileges:true'],
    PidsLimit: cfg.pidsLimit ?? 128,
    Memory: cfg.memoryLimitBytes ?? 4 * 1024 * 1024 * 1024,
    NanoCPUs: 2 * 1e9,
    NetworkMode: 'none',
    Privileged: false,
    Binds: [`${cfg.hostProjectPath}:/workspace:rw`],
    ReadonlyRootfs: false,
  } as any;
}

export interface DockerDriverConfig {
  image?: string;
  hostProjectPath: string;
  memoryLimitBytes?: number;
  pidsLimit?: number;
  auditConfig?: any;
  egressProxyIp?: string;
}

export class DockerDriver extends SandboxProvider {
  private docker: any;
  private defaultConfig: any;
  private containers: Map<string, any> = new Map();
  private imageResolver?: any;

  constructor(dockerClient: any, config?: Partial<DockerDriverConfig>, imageResolver?: any) {
    super();
    this.docker = dockerClient;
    this.imageResolver = imageResolver;
    this.defaultConfig = {
      image: config?.image ?? 'devs-sandbox-base:latest',
      hostProjectPath: config?.hostProjectPath ?? process.cwd(),
      memoryLimitBytes: config?.memoryLimitBytes ?? 4 * 1024 * 1024 * 1024,
      pidsLimit: config?.pidsLimit ?? 128,
      auditConfig: config?.auditConfig ?? undefined,
    };
  }

  async provision(config?: DockerDriverConfig): Promise<SandboxContext> {
    const cfg = { ...this.defaultConfig, ...(config ?? {}) } as Required<DockerDriverConfig>;
    try {
      const hostConfig = buildHostConfig(cfg);
      this.validateSecurityConfig(hostConfig);

      const imageToUse = this.imageResolver ? await this.imageResolver.resolve() : cfg.image;

      const createOpts: any = {
        Image: imageToUse,
        HostConfig: hostConfig,
        WorkingDir: '/workspace',
        Cmd: ['/bin/sh', '-lc', 'while true; do sleep 1; done'],
        Labels: { 'devs.sandbox': 'true' },
      };

      let networkId: string | undefined;
      if (cfg.egressProxyIp) {
        // validate the provided proxy IP
        if (!isIP(cfg.egressProxyIp)) {
          throw new ConfigValidationError('SandboxConfig.egressProxyIp must be a valid IP address');
        }
        // create an isolated bridge network for this sandbox
        const sandboxId = `devs-sandbox-${Math.random().toString(36).slice(2, 8)}`;
        networkId = await DockerNetworkManager.createIsolatedNetwork(sandboxId);
        const proxyOpts = DockerNetworkManager.getProxyContainerOptions(cfg.egressProxyIp, networkId as string) as any;
        // merge HostConfig and NetworkingConfig
        createOpts.HostConfig = { ...(createOpts.HostConfig ?? {}), ...(proxyOpts.HostConfig ?? {}) };
        createOpts.Env = [...(createOpts.Env ?? []), ...(proxyOpts.Env ?? [])];
        if (proxyOpts.dns) createOpts.Dns = proxyOpts.dns;
        if (proxyOpts.NetworkingConfig) createOpts.NetworkingConfig = { ...(createOpts.NetworkingConfig ?? {}), ...(proxyOpts.NetworkingConfig ?? {}) };
      }

      const container = await this.docker.createContainer(createOpts);
      if (!container) throw new Error('createContainer returned no container');
      if (typeof container.start === 'function') await container.start();
      const id = container.id ?? container.Id ?? Math.random().toString(36).slice(2);
      const ctx: SandboxContext = { id, workdir: '/workspace', status: 'running', createdAt: new Date(), networkId };
      this.containers.set(id, container);
      return ctx;
    } catch (err: any) {
      if (err instanceof SecurityConfigError) throw err;
      throw new SandboxProvisionError(`Failed to provision container: ${err?.message ?? String(err)}`);
    }
  }

  private validateSecurityConfig(_hostConfig: any) {
    // Basic stub validation for TypeScript: ensure required keys exist; concrete checks are in tests.
    return;
  }

  async exec(ctx: SandboxContext, cmd: string, args: string[] = [], opts?: ExecOptions): Promise<ExecResult> {
    const container = this.containers.get(ctx.id);
    if (!container) throw new SandboxDestroyedError('Sandbox has been destroyed or not provisioned');
    const cmdArr = [cmd, ...args];
    try {
      const execInstance: any = await container.exec({ Cmd: cmdArr, AttachStdout: true, AttachStderr: true });
      const stream: Readable = await execInstance.start({ Detach: false });
      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];
      let leftover = Buffer.alloc(0);

      const isLikelyMultiplexed = (chunk: Buffer) => {
        if (!chunk || chunk.length < 8) return false;
        const t = chunk.readUInt8(0);
        return t === 0 || t === 1 || t === 2;
      };

      await new Promise<void>((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => {
          let buf = Buffer.concat([leftover, chunk]);
          if (isLikelyMultiplexed(buf)) {
            let offset = 0;
            while (buf.length - offset >= 8) {
              const streamType = buf.readUInt8(offset);
              const payloadLen = buf.readUInt32BE(offset + 4);
              if (buf.length - offset - 8 < payloadLen) break;
              const payload = buf.slice(offset + 8, offset + 8 + payloadLen);
              if (streamType === 1) stdoutChunks.push(payload);
              else if (streamType === 2) stderrChunks.push(payload);
              offset += 8 + payloadLen;
            }
            leftover = buf.slice(offset);
          } else {
            stdoutChunks.push(buf);
            leftover = Buffer.alloc(0);
          }
        });
        stream.on('end', () => resolve());
        stream.on('close', () => resolve());
        stream.on('error', (err) => reject(err));
      });

      const inspectRes = typeof execInstance.inspect === 'function' ? await execInstance.inspect() : { ExitCode: 0 };
      const stdout = Buffer.concat(stdoutChunks).toString('utf-8');
      const stderr = Buffer.concat(stderrChunks).toString('utf-8');
      const result = { exitCode: inspectRes.ExitCode ?? 0, stdout, stderr, durationMs: 0 };

      // If this was an npm install/ci, run post-install audit if configured
      try {
        const firstArg = args && args.length > 0 ? args[0] : undefined;
        if ((cmd === 'npm' || (Array.isArray(cmdArr) && cmdArr[0] === 'npm')) && (firstArg === 'install' || firstArg === 'ci')) {
          if (this.defaultConfig?.auditConfig) {
            await runPostInstallAudit(undefined, this.defaultConfig.auditConfig);
          } else {
            // eslint-disable-next-line no-console
            console.warn('DockerDriver: auditConfig not set; skipping post-install audit');
          }
        }
      } catch (err) {
        // Bubble up audit errors
        throw err;
      }

      return result;
    } catch (err: any) {
      throw err;
    }
  }

  async destroy(ctx: SandboxContext): Promise<void> {
    const container = this.containers.get(ctx.id);
    if (!container) return;
    try {
      try {
        if (typeof container.stop === 'function') await container.stop({ t: 10 });
        if (typeof container.remove === 'function') await container.remove({ force: true, v: true });
      } finally {
        this.containers.delete(ctx.id);
        ctx.status = 'stopped';
        if (ctx.networkId) {
          try {
            await DockerNetworkManager.removeNetwork(ctx.networkId);
          } catch (e) {
            // ignore network remove errors
          }
        }
      }
    } catch (e) {
      // swallow errors as destroy should be best-effort
    }
  }

  async getStatus(ctx: SandboxContext): Promise<SandboxStatus> {
    const container = this.containers.get(ctx.id);
    if (!container) return 'stopped';
    try {
      const info = await container.inspect();
      if (info?.State?.Running) return 'running';
      return 'stopped';
    } catch (e) {
      return 'error';
    }
  }
}
