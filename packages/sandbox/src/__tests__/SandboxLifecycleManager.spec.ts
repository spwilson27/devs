import { describe, it, expect, vi } from 'vitest';
import { SandboxLifecycleManager } from '../SandboxLifecycleManager';
import { SandboxProvider } from '../SandboxProvider';
import type { SandboxContext } from '../types';
import { SandboxPreFlightError, SandboxTimeoutError, SandboxProvisionError } from '../errors';

class MockSandboxProvider extends SandboxProvider {
  provisionCalled = 0;
  execCalls: Array<{ cmd: string; args: string[] }> = [];
  destroyCalls = 0;
  idCounter = 0;
  execResponse: { exitCode: number } | null = null;

  async provision(): Promise<SandboxContext> {
    this.provisionCalled++;
    const id = `mock-${++this.idCounter}`;
    return { id, workdir: `/tmp/${id}`, status: 'running', createdAt: new Date() };
  }

  async exec(ctx: SandboxContext, cmd: string, args: string[], opts?: any) {
    this.execCalls.push({ cmd, args });
    if (this.execResponse) return { stdout: '', stderr: '', exitCode: this.execResponse.exitCode, durationMs: 1 };
    return { stdout: '', stderr: '', exitCode: 0, durationMs: 1 };
  }

  async destroy(ctx: SandboxContext) {
    this.destroyCalls++;
  }
}

describe('SandboxLifecycleManager', () => {
  it('provisions once and passes ctx to fn, and destroys on success', async () => {
    const p = new MockSandboxProvider();
    const manager = new SandboxLifecycleManager(p, {});
    let receivedCtx: SandboxContext | undefined;
    const res = await manager.runInSandbox('task-1', async (ctx) => {
      receivedCtx = ctx;
      return 'ok';
    });
    expect(p.provisionCalled).toBe(1);
    expect(receivedCtx).toBeDefined();
    expect(p.destroyCalls).toBe(1);
    expect(res).toBe('ok');
  });

  it('destroys sandbox when fn throws', async () => {
    const p = new MockSandboxProvider();
    const manager = new SandboxLifecycleManager(p, {});
    await expect(
      manager.runInSandbox('task-err', async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');
    expect(p.destroyCalls).toBe(1);
  });

  it('propagates provision errors and does not destroy', async () => {
    class BadProvider extends MockSandboxProvider {
      async provision() {
        throw new SandboxProvisionError('fail');
      }
    }
    const p = new BadProvider();
    const manager = new SandboxLifecycleManager(p, {});
    await expect(manager.runInSandbox('task-bad', async () => 'ok')).rejects.toThrow(SandboxProvisionError);
    expect(p.destroyCalls).toBe(0);
  });

  it('runs pre-flight commands in order and destroys on failure', async () => {
    const p = new MockSandboxProvider();
    // configure exec to fail on second command
    p.execResponse = null; // default success
    const manager = new SandboxLifecycleManager(p, {
      preFlightCommands: [
        { cmd: 'echo', args: ['one'] },
        { cmd: 'fail-cmd', args: ['bad'] },
      ],
      totalTimeoutMs: 1000,
    });

    // make exec return non-zero for the 'fail-cmd'
    // we override exec to examine the command
    const originalExec = p.exec.bind(p);
    p.exec = async (ctx: SandboxContext, cmd: string, args: string[], opts?: any) => {
      p.execCalls.push({ cmd, args });
      if (cmd === 'fail-cmd') return { stdout: '', stderr: 'err', exitCode: 2, durationMs: 1 };
      return { stdout: '', stderr: '', exitCode: 0, durationMs: 1 };
    };

    await expect(manager.runInSandbox('task-preflight', async () => 'ok')).rejects.toThrow(SandboxPreFlightError);
    expect(p.execCalls.length).toBeGreaterThanOrEqual(2);
    expect(p.destroyCalls).toBe(1);
  });

  it('creates unique sandbox contexts for sequential runs', async () => {
    const p = new MockSandboxProvider();
    const manager = new SandboxLifecycleManager(p, {});
    const id1 = await manager.runInSandbox('t1', async (ctx) => ctx.id);
    const id2 = await manager.runInSandbox('t2', async (ctx) => ctx.id);
    expect(id1).not.toBe(id2);
  });

  it('creates separate sandboxes for concurrent runs', async () => {
    const p = new MockSandboxProvider();
    const manager = new SandboxLifecycleManager(p, {});
    const ids = await Promise.all(
      Array.from({ length: 5 }, (_, i) => manager.runInSandbox(`task-${i}`, async (ctx) => ctx.id))
    );
    expect(new Set(ids).size).toBe(5);
    expect(p.provisionCalled).toBe(5);
  });

  it('times out and destroys sandbox when execution exceeds totalTimeoutMs', async () => {
    const p = new MockSandboxProvider();
    const manager = new SandboxLifecycleManager(p, { totalTimeoutMs: 10 });
    await expect(
      manager.runInSandbox('task-timeout', async () => new Promise((res) => setTimeout(() => res('done'), 50)))
    ).rejects.toThrow(SandboxTimeoutError);
    expect(p.destroyCalls).toBe(1);
  });

  it('emits provisioned and destroyed events with context and reason', async () => {
    const p = new MockSandboxProvider();
    const manager = new SandboxLifecycleManager(p, {});
    const prov: any[] = [];
    const dest: any[] = [];
    manager.on('sandbox:provisioned', (payload) => prov.push(payload));
    manager.on('sandbox:destroyed', (payload) => dest.push(payload));
    const id = await manager.runInSandbox('task-events', async (ctx) => ctx.id);
    expect(prov.length).toBe(1);
    expect(prov[0].taskLabel).toBe('task-events');
    expect(prov[0].ctx.id).toBe(id);
    expect(dest.length).toBe(1);
    expect(dest[0].reason).toBe('success');
    expect(dest[0].taskLabel).toBe('task-events');
  });
});
