import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';

// Mock child_process.spawn per-vitest ESM mocking rules
vi.mock('child_process', () => ({ spawn: vi.fn() }));

describe('SandboxManager', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('invokes handler.onOomKill when docker events emits a container id', async () => {
    const { spawn } = await import('child_process') as any;
    const fakeStdout = new EventEmitter();
    const fakeProc: any = new EventEmitter();
    fakeProc.stdout = fakeStdout;
    fakeProc.kill = vi.fn();

    (spawn as any).mockImplementation(() => fakeProc);

    const { SandboxManager } = await import('../SandboxManager');

    const handler = { onOomKill: vi.fn(async (id: string) => {}) };
    const mgr = new SandboxManager(handler as any);
    mgr.start();

    // emit an oom event id asynchronously
    setImmediate(() => fakeStdout.emit('data', Buffer.from('container-abc\n')));

    // wait briefly for async handler to be invoked
    await new Promise((r) => setTimeout(r, 20));

    expect(handler.onOomKill).toHaveBeenCalledWith('container-abc');
    mgr.stop();
  });
});
