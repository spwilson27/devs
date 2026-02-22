import { Readable } from 'stream';
import { SandboxProvider } from '../SandboxProvider';
import type { SandboxContext, ExecOptions, ExecResult, SandboxStatus } from '../types';
import { SandboxProvisionError, SandboxDestroyedError, SecurityConfigError } from '../errors';

export interface DockerDriverConfig {
  image?: string;
  hostProjectPath: string;
  memoryLimitBytes?: number;
  pidsLimit?: number;
  cpuCores?: number;
  networkMode?: 'none' | 'bridge' | string;
}

/** @internal Builds the HostConfig used for container creation. Exported for verification scripts. */
export function buildHostConfig(config: Required<DockerDriverConfig>) {
  return {
    CapDrop: ['ALL'],
    SecurityOpt: ['no-new-privileges:true'],
    PidsLimit: config.pidsLimit ?? 128,
    Memory: config.memoryLimitBytes ?? 4 * 1024 * 1024 * 1024,
    NanoCPUs: (config.cpuCores ?? 2) * 1e9,
    NetworkMode: config.networkMode ?? 'none',
    Privileged: false,
    Binds: [`${config.hostProjectPath}:/workspace:rw`],
    ReadonlyRootfs: false,
  } as any;
}

export class DockerDriver extends SandboxProvider {
  private docker: any;
  private defaultConfig: Required<DockerDriverConfig>;
  private containers: Map<string, any> = new Map();

  constructor(dockerClient: any, config?: Partial<DockerDriverConfig>) {
    super();
    this.docker = dockerClient;
    this.defaultConfig = {
      image: config?.image ?? 'devs-sandbox-base:latest',
      hostProjectPath: config?.hostProjectPath ?? process.cwd(),
      memoryLimitBytes: config?.memoryLimitBytes ?? 4 * 1024 * 1024 * 1024,
      pidsLimit: config?.pidsLimit ?? 128,
      cpuCores: config?.cpuCores ?? 2,
      networkMode: config?.networkMode ?? 'none',
    } as Required<DockerDriverConfig>;
  }

  private validateSecurityConfig(hostConfig: any): void {
    if (!hostConfig?.CapDrop || !Array.isArray(hostConfig.CapDrop) || !hostConfig.CapDrop.includes('ALL')) {
      throw new SecurityConfigError('HostConfig.CapDrop must include "ALL"');
    }
    if (!hostConfig?.SecurityOpt || !Array.isArray(hostConfig.SecurityOpt) || !hostConfig.SecurityOpt.includes('no-new-privileges:true')) {
      throw new SecurityConfigError('HostConfig.SecurityOpt must include "no-new-privileges:true"');
    }
  }

  async provision(config?: DockerDriverConfig): Promise<SandboxContext> {
    const cfg = { ...this.defaultConfig, ...(config ?? {}) } as Required<DockerDriverConfig>;
    try {
      const hostConfig = buildHostConfig(cfg);
      this.validateSecurityConfig(hostConfig);

      const createOpts: any = {
        Image: cfg.image,
        HostConfig: hostConfig,
        WorkingDir: '/workspace',
        Cmd: ['/bin/sh', '-lc', 'while true; do sleep 1; done'],
        Labels: { 'devs.sandbox': 'true' },
      };

      const container = await this.docker.createContainer(createOpts);
      if (!container) throw new Error('createContainer returned no container');
      if (typeof container.start === 'function') await container.start();
      const id = container.id ?? container.Id ?? Math.random().toString(36).slice(2);
      const ctx: SandboxContext = { id, workdir: '/workspace', status: 'running', createdAt: new Date() };
      this.containers.set(id, container);
      return ctx;
    } catch (err: any) {
      if (err instanceof SecurityConfigError) throw err;
      throw new SandboxProvisionError(`Failed to provision container: ${err?.message ?? String(err)}`);
    }
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
      return { exitCode: inspectRes.ExitCode ?? 0, stdout, stderr, durationMs: 0 };
    } catch (err: any) {
      throw err;
    }
  }

  async destroy(ctx: SandboxContext): Promise<void> {
    const container = this.containers.get(ctx.id);
    if (!container) return;
    try {
      if (typeof container.stop === 'function') await container.stop({ t: 10 });
    } catch (e) {
      // ignore stop errors
    }
    try {
      if (typeof container.remove === 'function') await container.remove({ force: true, v: true });
    } catch (e) {
      // ignore remove errors
    }
    this.containers.delete(ctx.id);
    ctx.status = 'stopped';
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
