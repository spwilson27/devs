import { describe, it, expect, vi } from 'vitest';
import { Readable } from 'stream';

vi.mock('@webcontainer/api', () => {
  const WebContainer = { boot: vi.fn() };
  return { WebContainer };
});

import { WebContainer } from '@webcontainer/api';
import { WebContainerDriver } from '../webcontainer-driver';
import { SandboxNotBootedError } from '../errors';

describe('WebContainerDriver (contract)', () => {
  it('exposes expected methods', () => {
    const driver = new WebContainerDriver({ defaultTimeoutMs: 1000, workdirPath: '/workspace' });
    expect(typeof driver.boot).toBe('function');
    expect(typeof driver.exec).toBe('function');
    // support both destroy() and teardown() naming
    expect(typeof (driver as any).destroy === 'function' || typeof (driver as any).teardown === 'function').toBe(true);
    // installPackages should be available on the driver
    expect(typeof (driver as any).installPackages === 'function').toBe(true);
  });

  it('boot() returns Promise<void>', async () => {
    const mockWc = { spawn: vi.fn(), teardown: vi.fn() };
    (WebContainer as any).boot.mockResolvedValueOnce(mockWc);

    const driver = new WebContainerDriver({ defaultTimeoutMs: 1000, workdirPath: '/workspace' });
    await expect(driver.boot()).resolves.toBeUndefined();
  });

  it('exec() after boot returns stdout/exitCode', async () => {
    const stdout = new Readable({ read() { this.push('hello\n'); this.push(null); } });
    const stderr = new Readable({ read() { this.push(null); } });
    const kill = vi.fn();

    const mockSpawn = vi.fn().mockReturnValueOnce({ stdout, stderr, exit: Promise.resolve(0), kill });
    const mockWc = { spawn: mockSpawn, teardown: vi.fn() };
    (WebContainer as any).boot.mockResolvedValueOnce(mockWc);

    const driver = new WebContainerDriver({ defaultTimeoutMs: 1000, workdirPath: '/workspace' });
    const ctx = await driver.provision();

    const res = await driver.exec(ctx, 'echo', ['hello']);
    expect(res.stdout).toBe('hello\n');
    expect(res.exitCode).toBe(0);
  });

  it('exec() before boot() throws SandboxNotBootedError', async () => {
    const driver = new WebContainerDriver({ defaultTimeoutMs: 1000, workdirPath: '/workspace' });
    await expect(driver.exec({} as any, 'echo', ['hello'])).rejects.toThrow(SandboxNotBootedError);
  });

  it('exec() after teardown() throws SandboxNotBootedError', async () => {
    const mockWc = { spawn: vi.fn(), teardown: vi.fn() };
    (WebContainer as any).boot.mockResolvedValueOnce(mockWc);

    const driver = new WebContainerDriver({ defaultTimeoutMs: 1000, workdirPath: '/workspace' });
    const ctx = await driver.provision();
    await (driver as any).teardown();

    await expect(driver.exec(ctx, 'echo', ['hello'])).rejects.toThrow(SandboxNotBootedError);
  });
});
