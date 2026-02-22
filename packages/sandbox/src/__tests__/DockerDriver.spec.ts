import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockExecFile = vi.fn();
vi.mock('child_process', () => ({
  execFile: (...args: any[]) => {
    // last arg is callback in the callback-style API; tests use mock implementations
    return mockExecFile(...args);
  },
}));

import { DockerDriver } from '../drivers/DockerDriver';
import { SandboxProvider } from '../SandboxProvider';
import { SandboxProvisionError } from '../errors';
import { ExecutionTimeoutError } from '../utils/execution-timeout';
import type { SandboxContext } from '../types';

describe('DockerDriver (unit)', () => {
  beforeEach(() => {
    mockExecFile.mockReset();
  });

  it('extends SandboxProvider and can be instantiated', () => {
    const driver = new DockerDriver({});
    expect(driver).toBeInstanceOf(SandboxProvider);
  });

  it('provision() calls docker run with hardened flags and returns context', async () => {
    let capturedArgs: string[] = [];
    mockExecFile.mockImplementationOnce((cmd: any, args: any, opts: any, cb: any) => {
      capturedArgs = args;
      cb(null, 'container-123\n', '');
      return {} as any;
    });

    const driver = new DockerDriver({});
    const ctx = await driver.provision();

    expect(capturedArgs).toContain('--cap-drop=ALL');
    expect(capturedArgs).toContain('--security-opt=no-new-privileges');
    expect(capturedArgs).toContain('--read-only');
    expect(capturedArgs).toContain('--network=none');
    expect(capturedArgs).toContain('--memory=4g');
    expect(capturedArgs).toContain('--cpus=2');

    expect(ctx.id).toBe('container-123');
    expect(ctx.workdir).toBe('/workspace');
    expect(ctx.status).toBe('running');
  });

  it('exec() calls docker exec and returns ExecResult', async () => {
    mockExecFile.mockImplementationOnce((cmd: any, args: any, opts: any, cb: any) => {
      // provision
      cb(null, 'container-123\n', '');
      return {} as any;
    });
    mockExecFile.mockImplementationOnce((cmd: any, args: any, opts: any, cb: any) => {
      // exec
      expect(args[0]).toBe('exec');
      cb(null, 'hello\n', '');
      return {} as any;
    });

    const driver = new DockerDriver({});
    const ctx = await driver.provision();
    const res = await driver.exec(ctx, 'echo', ['hello']);
    expect(res.stdout).toBe('hello\n');
    expect(res.exitCode).toBe(0);
  });

  it('destroy() removes container', async () => {
    mockExecFile.mockImplementationOnce((cmd: any, args: any, opts: any, cb: any) => {
      cb(null, 'container-1\n', '');
      return {} as any;
    });
    mockExecFile.mockImplementationOnce((cmd: any, args: any, opts: any, cb: any) => {
      // rm -f
      expect(args[0]).toBe('rm');
      expect(args[1]).toBe('-f');
      expect(args[2]).toBe('container-1');
      cb(null, '', '');
      return {} as any;
    });

    const driver = new DockerDriver({});
    const ctx = await driver.provision();
    await driver.destroy(ctx);
    expect(ctx.status).toBe('stopped');
  });

  it('provision() failure throws SandboxProvisionError', async () => {
    mockExecFile.mockImplementationOnce((cmd: any, args: any, opts: any, cb: any) => {
      cb(new Error('image not found'), '', '');
      return {} as any;
    });

    const driver = new DockerDriver({});
    await expect(driver.provision()).rejects.toThrow(SandboxProvisionError);
  });

  it('exec() respects timeout and throws SandboxExecTimeoutError', async () => {
    mockExecFile.mockImplementation((cmd: any, args: any, opts: any, cb: any) => {
      // never call cb to simulate a hanging process
      return {} as any;
    });

    const driver = new DockerDriver({});
    const ctx: SandboxContext = { id: 'container-timeout', workdir: '/workspace', status: 'running', createdAt: new Date() };
    await expect(driver.exec(ctx, 'sleep', ['10'], { timeoutMs: 10 })).rejects.toThrow(ExecutionTimeoutError);
  });
});
