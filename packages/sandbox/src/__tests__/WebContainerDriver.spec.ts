import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockInstance: any;
vi.mock('@webcontainer/api', () => {
  mockInstance = {
    fs: { mkdir: vi.fn(async () => {}) },
    spawn: vi.fn((cmd: string, args: string[], opts: any) => {
      if (cmd === 'node') {
        return {
          exit: Promise.resolve(0),
          getOutput: async () => 'hello\n',
          stderr: '',
        };
      } else if (cmd === 'sleep') {
        return {
          exit: new Promise(() => {}),
          getOutput: async () => '',
          stderr: '',
        };
      } else {
        return {
          exit: Promise.resolve(127),
          getOutput: async () => { throw new Error('exec format error'); },
          stderr: 'cannot execute binary',
        };
      }
    }),
    teardown: vi.fn(async () => {}),
  };
  class MockWebContainer {
    static async boot() {
      return mockInstance;
    }
  }
  return { WebContainer: MockWebContainer };
});

import { WebContainerDriver } from '../drivers/WebContainerDriver';
import { SandboxProvider } from '../SandboxProvider';
import { ExecutionTimeoutError } from '../utils/execution-timeout';
import type { SandboxContext } from '../types';

describe('WebContainerDriver (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extends SandboxProvider and can be instantiated', () => {
    const driver = new WebContainerDriver({});
    expect(driver).toBeInstanceOf(SandboxProvider);
  });

  it('provision boots webcontainer once and returns context', async () => {
    const driver = new WebContainerDriver({});
    const ctx = await driver.provision();
    expect(ctx.workdir).toBe('/workspace');
    expect(ctx.status).toBe('running');
    const ctx2 = await driver.provision();
    expect(ctx2).toBe(ctx);
  });

  it('exec() runs node and returns stdout', async () => {
    const driver = new WebContainerDriver({});
    const ctx = await driver.provision();
    const res = await driver.exec(ctx, 'node', ['-e', 'console.log("hello")']);
    expect(res.stdout).toBe('hello\n');
    expect(res.exitCode).toBe(0);
    expect(res.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('exec respects timeout and throws SandboxExecTimeoutError', async () => {
    const driver = new WebContainerDriver({});
    const ctx = await driver.provision();
    await expect(driver.exec(ctx, 'sleep', ['10'], { timeoutMs: 10 })).rejects.toThrow(ExecutionTimeoutError);
  });

  it('destroy() calls teardown and stops context', async () => {
    const driver = new WebContainerDriver({});
    const ctx = await driver.provision();
    await driver.destroy(ctx);
    expect(mockInstance.teardown).toHaveBeenCalled();
    expect(ctx.status).toBe('stopped');
  });

  it('exec unsupported binary rejects with an error', async () => {
    const driver = new WebContainerDriver({});
    const ctx = await driver.provision();
    await expect(driver.exec(ctx, 'native-binary', ['arg'])).rejects.toThrow();
  });
});
