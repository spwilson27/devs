import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Readable } from 'stream';

vi.mock('@webcontainer/api', () => {
  const WebContainer = {
    boot: vi.fn(),
  };
  return { WebContainer };
});

import { WebContainer } from '@webcontainer/api';
import { WebContainerDriver } from '../webcontainer-driver';
import { SandboxProvider } from '../../../SandboxProvider';
import { SandboxBootError, SandboxExecError, SandboxTimeoutError, SandboxNotBootedError, SandboxTeardownError } from '../errors';

describe('WebContainerDriver (unit)', () => {
  beforeEach(() => {
    WebContainer.boot.mockReset();
  });

  it('extends SandboxProvider and can be instantiated', () => {
    const driver = new WebContainerDriver({});
    expect(driver).toBeInstanceOf(SandboxProvider);
  });

  it('provision() calls WebContainer.boot() and returns context', async () => {
    const mockSpawn = vi.fn();
    const mockTeardown = vi.fn();
    const wc = { spawn: mockSpawn, teardown: mockTeardown };
    WebContainer.boot.mockResolvedValueOnce(wc);

    const driver = new WebContainerDriver({ defaultTimeoutMs: 1000, workdirPath: '/workspace' });
    const ctx = await driver.provision();

    expect(WebContainer.boot).toHaveBeenCalledTimes(1);
    expect(ctx.workdir).toBe('/workspace');
    expect(ctx.status).toBe('running');
  });

  it('exec() calls spawn and returns ExecResult', async () => {
    const mockSpawn = vi.fn();
    const mockTeardown = vi.fn();
    const wc = { spawn: mockSpawn, teardown: mockTeardown };
    WebContainer.boot.mockResolvedValueOnce(wc);

    const driver = new WebContainerDriver({});
    const ctx = await driver.provision();

    const stdout = new Readable({
      read() {
        this.push('hello\n');
        this.push(null);
      },
    });
    const stderr = new Readable({
      read() {
        this.push(null);
      },
    });

    const kill = vi.fn();
    mockSpawn.mockReturnValueOnce({ stdout, stderr, exit: Promise.resolve(0), kill });

    const res = await driver.exec(ctx, 'echo', ['hello']);
    expect(res.stdout).toBe('hello\n');
    expect(res.exitCode).toBe(0);
    expect(mockSpawn).toHaveBeenCalledWith('echo', ['hello']);
  });

  it('exec() throws SandboxExecError if spawn throws', async () => {
    const mockSpawn = vi.fn();
    const mockTeardown = vi.fn();
    const wc = { spawn: mockSpawn, teardown: mockTeardown };
    WebContainer.boot.mockResolvedValueOnce(wc);

    const driver = new WebContainerDriver({});
    const ctx = await driver.provision();

    mockSpawn.mockImplementationOnce(() => {
      throw new Error('spawn fail');
    });

    await expect(driver.exec(ctx, 'cmd', [])).rejects.toThrow(SandboxExecError);
  });

  it('exec() times out and kills process', async () => {
    const mockSpawn = vi.fn();
    const mockTeardown = vi.fn();
    const wc = { spawn: mockSpawn, teardown: mockTeardown };
    WebContainer.boot.mockResolvedValueOnce(wc);

    const driver = new WebContainerDriver({});
    const ctx = await driver.provision();

    const stdout = new Readable({ read() {} });
    const stderr = new Readable({ read() {} });
    const kill = vi.fn();

    mockSpawn.mockReturnValueOnce({ stdout, stderr, exit: new Promise<number>(() => {}), kill });

    await expect(driver.exec(ctx, 'sleep', ['10'], { timeoutMs: 10 })).rejects.toThrow(SandboxTimeoutError);
    expect(kill).toHaveBeenCalled();
  });

  it('destroy() calls teardown() exactly once and is idempotent', async () => {
    const mockSpawn = vi.fn();
    const mockTeardown = vi.fn();
    const wc = { spawn: mockSpawn, teardown: mockTeardown };
    WebContainer.boot.mockResolvedValueOnce(wc);
    mockTeardown.mockResolvedValueOnce(undefined);

    const driver = new WebContainerDriver({});
    const ctx = await driver.provision();

    await driver.destroy(ctx);
    await driver.destroy(ctx);

    expect(mockTeardown).toHaveBeenCalledTimes(1);
  });

});
