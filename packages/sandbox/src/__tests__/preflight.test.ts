import { describe, it, expect, vi } from 'vitest';
import { PreflightService } from '../preflight/PreflightService';
import { PreflightError } from '../preflight/PreflightError';
import { SANDBOX_PATHS } from '../config';
import type { TaskManifest, McpConfig } from '../types';
import { SandboxProvider } from '../providers';
import type { FilesystemManager } from '../filesystem';

class MockProvider extends SandboxProvider {
  public execCalls: any[] = [];
  async provision(id: string, opts?: any): Promise<any> {
    return { id: 'mock-1', workdir: SANDBOX_PATHS.workspace, status: 'running', createdAt: new Date().toISOString() };
  }
  async exec(ctx: any, cmd: string, args: string[] = [], opts?: any) {
    this.execCalls.push({ ctx, cmd, args, opts });
    return { stdout: '', stderr: '', exitCode: 0, durationMs: 1 };
  }
  async destroy(ctx: any) {}
  async getResourceStats(ctx: any) { return { cpuPercent: 0, memoryBytes: 0, timestamp: new Date().toISOString() }; }
}

describe('PreflightService', () => {
  it('injectCodebase calls FilesystemManager.sync with excludes', async () => {
    const fs: FilesystemManager = { sync: vi.fn().mockResolvedValue(undefined) };
    const provider = new MockProvider();
    const svc = new PreflightService(provider, fs);
    await svc.injectCodebase('sb1', '/host/project');
    expect((fs.sync as any)).toHaveBeenCalledWith('/host/project', 'sb1', expect.objectContaining({ exclude: expect.arrayContaining(['.git', '.devs']) }));
  });

  it('injectTaskRequirements writes task manifest via provider.execWithStdin', async () => {
    const fs: FilesystemManager = { sync: vi.fn().mockResolvedValue(undefined) };
    const provider = new MockProvider();
    const svc = new PreflightService(provider, fs);
    const task: TaskManifest = { id: 't1', name: 'Test Task' };
    await svc.injectTaskRequirements('sb1', task);
    expect(provider.execCalls.length).toBeGreaterThan(0);
    const last = provider.execCalls[provider.execCalls.length - 1];
    expect(last.opts?.stdin).toBe(JSON.stringify(task, null, 2));
    expect(last.cmd).toBe('sh');
    expect(last.args.join(' ')).toContain(SANDBOX_PATHS.taskManifest);
  });

  it('injectMcpTools writes mcp_config.json via provider.execWithStdin', async () => {
    const fs: FilesystemManager = { sync: vi.fn().mockResolvedValue(undefined) };
    const provider = new MockProvider();
    const svc = new PreflightService(provider, fs);
    const mcp: McpConfig = { serverUrl: 'http://localhost' };
    await svc.injectMcpTools('sb2', mcp);
    const last = provider.execCalls[provider.execCalls.length - 1];
    expect(last.opts?.stdin).toBe(JSON.stringify(mcp, null, 2));
    expect(last.args.join(' ')).toContain(SANDBOX_PATHS.mcpConfig);
  });

  it('runPreflight calls steps in order and ensures readiness', async () => {
    const calls: string[] = [];
    const fs: FilesystemManager = { sync: vi.fn().mockImplementation(async () => { calls.push('codebase'); }) };
    const provider = new MockProvider();
    provider.exec = vi.fn(async (ctx: any, cmd: string, args: any[], opts?: any) => { calls.push('ready-check'); return { stdout: '', stderr: '', exitCode: 0, durationMs: 1 }; }) as any;
    const svc = new PreflightService(provider, fs);
    svc.injectTaskRequirements = async (_id: string, _t: TaskManifest) => { calls.push('task'); };
    svc.injectMcpTools = async (_id: string, _m: McpConfig) => { calls.push('mcp'); };
    await svc.runPreflight('sbX', { projectRoot: '/p', task: { id: 't' } as any, mcpConfig: { serverUrl: 'x' } as any });
    expect(calls).toEqual(['codebase', 'task', 'mcp', 'ready-check']);
  });

  it('runPreflight wraps errors in PreflightError and does not leave partial sandbox', async () => {
    const fs: FilesystemManager = { sync: vi.fn().mockResolvedValue(undefined) };
    const provider = new MockProvider();
    const svc = new PreflightService(provider, fs);
    svc.injectTaskRequirements = async () => { throw new Error('boom'); };
    await expect(svc.runPreflight('s', { projectRoot: '/p', task: { id: 't' } as any, mcpConfig: { serverUrl: 'x' } as any })).rejects.toBeInstanceOf(PreflightError);
    expect(provider.execCalls.length).toBe(0);
  });
});
