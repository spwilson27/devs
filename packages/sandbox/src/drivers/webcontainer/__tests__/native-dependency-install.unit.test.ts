import { describe, it, expect, vi } from 'vitest';
import { Readable } from 'stream';

vi.mock('@webcontainer/api', () => {
  const WebContainer = {
    boot: vi.fn(),
  } as any;
  return { WebContainer };
});

import { WebContainer } from '@webcontainer/api';
import { WebContainerPackageInstaller } from '../package-installer';
import { NativeDependencyChecker } from '../native-dependency-checker';

describe('WebContainerPackageInstaller (unit)', () => {
  it('installs lodash using npm and returns installed array', async () => {
    const mockSpawn = vi.fn();
    const wc = { spawn: mockSpawn } as any;

    const stdout = new Readable({
      read() {
        this.push(null);
      },
    });
    const stderr = new Readable({
      read() {
        this.push(null);
      },
    });

    mockSpawn.mockReturnValueOnce({ stdout, stderr, exit: Promise.resolve(0) });

    const installer = new WebContainerPackageInstaller(wc, new NativeDependencyChecker());
    const res = await installer.install(['lodash']);

    expect(mockSpawn).toHaveBeenCalledTimes(1);
    expect(mockSpawn).toHaveBeenCalledWith('npm', ['install', '--prefer-offline', '--no-audit', '--no-fund', 'lodash']);
    expect(res.installed).toEqual(['lodash']);
    expect(res.failed).toEqual([]);
    expect(res.warnings).toEqual([]);
  });

  it('blocks better-sqlite3 without attempting npm spawn', async () => {
    const mockSpawn = vi.fn();
    const wc = { spawn: mockSpawn } as any;

    const installer = new WebContainerPackageInstaller(wc, new NativeDependencyChecker());
    const res = await installer.install(['better-sqlite3']);

    expect(mockSpawn).not.toHaveBeenCalled();
    expect(res.installed).toEqual([]);
    expect(res.failed).toEqual([
      { packageName: 'better-sqlite3', reason: expect.any(String), alternative: 'sql.js' },
    ]);
    expect(res.warnings).toEqual([]);
  });

  it('installs lodash and fails sharp (native without alternative)', async () => {
    const mockSpawn = vi.fn();
    const wc = { spawn: mockSpawn } as any;

    const stdout = new Readable({
      read() {
        this.push(null);
      },
    });
    const stderr = new Readable({
      read() {
        this.push(null);
      },
    });

    mockSpawn.mockReturnValueOnce({ stdout, stderr, exit: Promise.resolve(0) });

    const installer = new WebContainerPackageInstaller(wc, new NativeDependencyChecker());
    const res = await installer.install(['lodash', 'sharp']);

    expect(mockSpawn).toHaveBeenCalledTimes(1);
    expect(mockSpawn).toHaveBeenCalledWith('npm', ['install', '--prefer-offline', '--no-audit', '--no-fund', 'lodash']);
    expect(res.installed).toEqual(['lodash']);
    expect(res.failed).toEqual([
      { packageName: 'sharp', reason: expect.any(String), alternative: null },
    ]);
  });

  it('blocks bcrypt with suggested alternative and warning', async () => {
    const mockSpawn = vi.fn();
    const wc = { spawn: mockSpawn } as any;

    const installer = new WebContainerPackageInstaller(wc, new NativeDependencyChecker());
    const res = await installer.install(['bcrypt']);

    expect(mockSpawn).not.toHaveBeenCalled();
    expect(res.installed).toEqual([]);
    expect(res.failed).toEqual([
      { packageName: 'bcrypt', reason: expect.any(String), alternative: 'bcryptjs' },
    ]);
    expect(res.warnings).toEqual([
      "Package 'bcrypt' is not supported in WebContainers. Consider using 'bcryptjs' instead.",
    ]);
  });

  it('install([]) resolves immediately and does not spawn', async () => {
    const mockSpawn = vi.fn();
    const wc = { spawn: mockSpawn } as any;

    const installer = new WebContainerPackageInstaller(wc, new NativeDependencyChecker());
    const res = await installer.install([]);

    expect(res.installed).toEqual([]);
    expect(res.failed).toEqual([]);
    expect(res.warnings).toEqual([]);
    expect(mockSpawn).not.toHaveBeenCalled();
  });
});
