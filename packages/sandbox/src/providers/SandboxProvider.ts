import type { SandboxContext, ExecOptions, ExecResult, ResourceStats } from './types';
import type { SandboxProvisionOptions } from '../types/index';

export abstract class SandboxProvider {
  /**
   * Provision a new sandbox context (e.g., create container).
   * The id is an opaque identifier chosen by the caller.
   */
  abstract provision(id: string, opts?: Partial<SandboxProvisionOptions>): Promise<SandboxContext>;

  /**
   * Execute a command inside the given sandbox context.
   */
  abstract exec(ctx: SandboxContext, cmd: string, args?: string[], opts?: ExecOptions): Promise<ExecResult>;

  /**
   * Convenience helper to exec with stdin provided. Default implementation delegates to exec and
   * attaches stdin to opts; concrete drivers may override to support streaming stdin.
   */
  async execWithStdin(ctx: SandboxContext, cmd: string, args: string[] = [], stdin?: string, opts?: ExecOptions): Promise<ExecResult> {
    const merged: ExecOptions = { ...(opts ?? {}), ...(stdin ? { stdin } : {}) };
    return this.exec(ctx, cmd, args, merged);
  }

  /**
   * Destroy / cleanup the sandbox (remove container, volumes, etc).
   */
  abstract destroy(ctx: SandboxContext): Promise<void>;

  /**
   * Return resource usage metrics for the sandbox (CPU, memory, timestamp).
   */
  async getResourceStats(ctx: SandboxContext): Promise<ResourceStats> {
    // Default implementation returns zeroed metrics; drivers may override for real stats
    return { cpuPercent: 0, memoryBytes: 0, timestamp: new Date().toISOString() } as ResourceStats;
  }
}
