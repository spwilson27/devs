import type { SandboxContext, ExecOptions, ExecResult } from './types';

export abstract class SandboxProvider {
  abstract provision(): Promise<SandboxContext>;
  abstract exec(ctx: SandboxContext, cmd: string, args: string[], opts?: ExecOptions): Promise<ExecResult>;
  abstract destroy(ctx: SandboxContext): Promise<void>;
}
