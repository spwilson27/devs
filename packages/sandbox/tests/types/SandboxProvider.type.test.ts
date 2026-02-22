import { SandboxProvider } from '../../src/providers/SandboxProvider';
import type { SandboxContext, ExecResult } from '../../src/providers/types';

class TypeCheckedProvider extends SandboxProvider {
  async provision(id: string) { return { id, workdir: '/workspace', createdAt: new Date().toISOString() }; }
  async exec(ctx: SandboxContext, cmd: string, args?: string[], opts?: any): Promise<ExecResult> { return { stdout: '', stderr: '', exitCode: 0 }; }
  async destroy(ctx: SandboxContext): Promise<void> { return; }
  async getResourceStats(ctx: SandboxContext) { return { cpuPercent: 0, memoryBytes: 0, timestamp: new Date().toISOString() }; }
}

export const _typecheckInstance: SandboxProvider = new TypeCheckedProvider();
