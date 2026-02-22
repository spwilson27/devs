import { describe, it, expect } from 'vitest';
import { SandboxProvider } from '../../src/providers/SandboxProvider';

describe('SandboxProvider runtime (MockProvider)', () => {
  it('allows subclassing and basic lifecycle', async () => {
    class MockProvider extends SandboxProvider {
      async provision(id: string) {
        return { id, workdir: '/workspace', createdAt: new Date().toISOString() };
      }
      async exec(ctx: any, cmd: string, args: string[] = [], opts?: any) {
        return { stdout: 'ok', stderr: '', exitCode: 0 };
      }
      async destroy(ctx: any) { /* noop */ }
      async getResourceStats(ctx: any) {
        return { cpuPercent: 0, memoryBytes: 1024, timestamp: new Date().toISOString() };
      }
    }

    const p = new MockProvider();
    const ctx = await p.provision('s1');
    expect(ctx.id).toBe('s1');

    const res = await p.exec(ctx, 'echo', ['hi']);
    expect(res.exitCode).toBe(0);

    const stats = await p.getResourceStats(ctx);
    expect(stats.memoryBytes).toBeGreaterThanOrEqual(0);

    await p.destroy(ctx);
  });
});
