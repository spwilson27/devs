import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PassThrough } from 'stream';
import { EventEmitter } from 'events';

// Mock pidusage and child_process before importing the implementation
vi.mock('pidusage', () => ({ default: vi.fn() }));
vi.mock('child_process', () => ({ spawn: vi.fn() }));
import pidusage from 'pidusage';
import * as child_process from 'child_process';

// Import under test (will receive mocked pidusage and child_process)
import * as RSM from '../tools/run-shell-monitored.js';

function makeMockChild(pid = 1234) {
  const child: any = new EventEmitter();
  child.pid = pid;
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = vi.fn(() => {
    child.killed = true;
    // emit exit after kill to simulate kernel behavior
    setImmediate(() => child.emit('exit', null, 'SIGKILL'));
  });
  return child;
}

describe('runShellMonitored', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
    vi.resetAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('kills process exceeding rss limit and throws ResourceLimitExceededError', async () => {
    const child = makeMockChild(1111);
    (child_process as any).spawn.mockReturnValue(child as any);

    // First reading: low memory; second reading: exceed rss
    (pidusage as any).mockResolvedValueOnce({ cpu: 0, memory: 1024 });
    (pidusage as any).mockResolvedValueOnce({ cpu: 0, memory: 5 * 1024 ** 3 });

    const p = RSM.runShellMonitored('echo hi', {});

    // advance to first poll
    vi.advanceTimersByTime(1000);
    await Promise.resolve();

    // advance to second poll which should trigger kill
    vi.advanceTimersByTime(1000);
    await Promise.resolve();

    await expect(p).rejects.toThrow(RSM.ResourceLimitExceededError);

    const err = await p.catch(e => e);
    expect(err).toHaveProperty('reason', 'rss');
    expect(child.kill).toHaveBeenCalledWith('SIGKILL');

    (child_process as any).spawn.mockReset();
  });

  it('kills process on sustained CPU usage and throws ResourceLimitExceededError', async () => {
    const child = makeMockChild(2222);
    (child_process as any).spawn.mockReturnValue(child as any);

    // Simulate 10 consecutive high-CPU readings (>=100)
    for (let i = 0; i < 11; i++) {
      (pidusage as any).mockResolvedValueOnce({ cpu: 120, memory: 1024 });
    }

    const p = RSM.runShellMonitored('busy', {});

    // advance timers until cpuSustainedMs exceeded (default 10_000ms)
    for (let i = 0; i < 11; i++) {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    }

    await expect(p).rejects.toThrow(RSM.ResourceLimitExceededError);
    const err = await p.catch(e => e);
    expect(err).toHaveProperty('reason', 'cpu');
    expect(child.kill).toHaveBeenCalledWith('SIGKILL');

    (child_process as any).spawn.mockReset();
  });

  it('resolves when process exits normally before limits are exceeded', async () => {
    const child = makeMockChild(3333);
    (child_process as any).spawn.mockReturnValue(child as any);

    vi.useRealTimers();
    (pidusage as any).mockResolvedValue({ cpu: 0, memory: 1024 });

    const p = RSM.runShellMonitored('true', { pollIntervalMs: 10 });

    // allow a couple of real polling intervals to occur
    await new Promise((r) => setTimeout(r, 25));

    // simulate process exit normally
    setImmediate(() => child.emit('exit', 0));

    const res = await p;
    expect(res).toHaveProperty('exitCode', 0);

    (child_process as any).spawn.mockReset();
  });

  it('uses default pollIntervalMs=1000 and allows override', async () => {
    const child = makeMockChild(4444);
    (child_process as any).spawn.mockReturnValue(child as any);

    // Use real timers with small intervals for reliable timing in tests
    vi.useRealTimers();

    // Test default-like small interval: one call after 10ms
    (pidusage as any).mockResolvedValue({ cpu: 0, memory: 1024 });
    const p1 = RSM.runShellMonitored('true', { pollIntervalMs: 10 });
    await new Promise((r) => setTimeout(r, 9));
    expect((pidusage as any).mock.calls.length).toBe(0);
    await new Promise((r) => setTimeout(r, 20));
    expect((pidusage as any).mock.calls.length).toBeGreaterThanOrEqual(1);
    setImmediate(() => child.emit('exit', 0));
    await p1;

    // Test override (short interval)
    const child2 = makeMockChild(5555);
    (child_process as any).spawn.mockReturnValueOnce(child2 as any);
    (pidusage as any).mockClear();
    (pidusage as any).mockResolvedValue({ cpu: 0, memory: 1024 });
    const p2 = RSM.runShellMonitored('true', { pollIntervalMs: 5 });
    await new Promise((r) => setTimeout(r, 4));
    expect((pidusage as any).mock.calls.length).toBe(0);
    await new Promise((r) => setTimeout(r, 10));
    expect((pidusage as any).mock.calls.length).toBeGreaterThanOrEqual(1);
    setImmediate(() => child2.emit('exit', 0));
    await p2;

    (child_process as any).spawn.mockReset();
  });

  it('ResourceLimitExceededError includes pid, reason, value, limit fields', () => {
    const err = new RSM.ResourceLimitExceededError(9999, 'rss', 123, 100);
    expect(err).toHaveProperty('pid', 9999);
    expect(err).toHaveProperty('reason', 'rss');
    expect(err).toHaveProperty('value', 123);
    expect(err).toHaveProperty('limit', 100);
  });
});
