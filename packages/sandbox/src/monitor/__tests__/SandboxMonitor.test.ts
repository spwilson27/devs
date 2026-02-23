import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SandboxMonitor } from '../SandboxMonitor';
import { SandboxStateManager } from '../SandboxStateManager';
import { SecurityEventLog } from '../SecurityEventLog';

describe('SandboxMonitor', () => {
  let mockProc: any;

  beforeEach(() => {
    mockProc = { kill: vi.fn(), pid: 12345 };
    SandboxStateManager.setState('RUNNING' as any);
    SecurityEventLog.clear();
  });

  it('emits breach and kills process when detector returns reason', async () => {
    const detector = vi.fn(async () => 'breach-detected');
    const monitor = new SandboxMonitor({ pollIntervalMs: 1000, sandboxId: 's1', processHandle: mockProc as any, detectors: [detector] });
    const breachPromise = new Promise((resolve) => monitor.on('breach', resolve));
    await (monitor as any)._checkForBreach();
    const event: any = await breachPromise;
    expect(mockProc.kill).toHaveBeenCalledWith('SIGKILL');
    expect(SandboxStateManager.getState()).toBe('SECURITY_PAUSE');
    expect(event).toMatchObject({ eventType: 'BREACH', sandboxId: 's1', reason: 'breach-detected', pid: 12345 });
  });

  it('start begins polling and stop halts polling', async () => {
    let calls = 0;
    const detector = async () => {
      calls++;
      return null;
    };
    const monitor = new SandboxMonitor({ pollIntervalMs: 20, sandboxId: 's1', processHandle: mockProc as any, detectors: [detector] });
    monitor.start();
    await new Promise((res) => setTimeout(res, 90));
    monitor.stop();
    const countAfterStop = calls;
    await new Promise((res) => setTimeout(res, 50));
    expect(calls).toBe(countAfterStop);
  });

  it('logs SecurityEvent to SecurityEventLog', async () => {
    const detector = async () => 'reason';
    const monitor = new SandboxMonitor({ pollIntervalMs: 1000, sandboxId: 's-log', processHandle: mockProc as any, detectors: [detector] });
    await (monitor as any)._checkForBreach();
    const entries = SecurityEventLog.getAll();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[entries.length - 1]).toMatchObject({ eventType: 'BREACH', sandboxId: 's-log', reason: 'reason', pid: 12345 });
  });
});
