import { describe, it, expect, vi } from 'vitest';
import { Readable } from 'stream';
import { DockerDriver } from '../DockerDriver';
import { SandboxProvisionError, SandboxDestroyedError } from '../../errors';
import type { SandboxContext } from '../../types';

describe('DockerDriver', () => {
  it('implements the SandboxProvider interface', () => {
    const mockDocker = {};
    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/path' });
    expect(typeof driver.provision).toBe('function');
    expect(typeof driver.exec).toBe('function');
    expect(typeof driver.destroy).toBe('function');
    expect(typeof (driver as any).getStatus).toBe('function');
  });

  it('provision() creates a container with the configured image and returns a SandboxContext', async () => {
    let capturedOpts: any;
    const fakeContainer = { id: 'cont1', start: vi.fn().mockResolvedValue(undefined) };
    const mockDocker = {
      createContainer: vi.fn().mockImplementation((opts) => {
        capturedOpts = opts;
        return Promise.resolve(fakeContainer);
      }),
    };

    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/proj', image: 'myimage:latest' });
    const ctx: SandboxContext = await driver.provision();
    expect(mockDocker.createContainer).toHaveBeenCalled();
    expect(ctx.id).toBe('cont1');
    expect(ctx.workdir).toBe('/workspace');
    expect(capturedOpts.HostConfig.Binds).toContain('/host/proj:/workspace:rw');
  });

  it('exec() runs a command inside the container and streams stdout/stderr', async () => {
    const stdoutData = Buffer.from('hello\n');
    const stderrData = Buffer.from('err\n');

    const mkFrame = (type: number, payload: Buffer) => {
      const header = Buffer.alloc(8);
      header.writeUInt8(type, 0);
      header.writeUInt32BE(payload.length, 4);
      return Buffer.concat([header, payload]);
    };

    const multiplexed = Buffer.concat([mkFrame(1, stdoutData), mkFrame(2, stderrData)]);

    const stream = new Readable({ read() {} });
    process.nextTick(() => {
      stream.push(multiplexed);
      stream.push(null);
    });

    const execInstance: any = {
      start: vi.fn().mockResolvedValue(stream),
      inspect: vi.fn().mockResolvedValue({ ExitCode: 0 }),
    };

    const fakeContainer: any = { exec: vi.fn().mockResolvedValue(execInstance), id: 'c1', start: vi.fn().mockResolvedValue(undefined) };
    const mockDocker = { createContainer: vi.fn().mockResolvedValue(fakeContainer) };

    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/proj' });
    const ctx = await driver.provision();

    const res = await driver.exec(ctx, 'echo', ['hello']);
    expect(res.stdout).toContain('hello');
    expect(res.stderr).toContain('err');
    expect(res.exitCode).toBe(0);
  });

  it('exec() resolves with exitCode=1 when the container command fails', async () => {
    const stdoutData = Buffer.from('nope\n');
    const mkFrame = (type: number, payload: Buffer) => {
      const header = Buffer.alloc(8);
      header.writeUInt8(type, 0);
      header.writeUInt32BE(payload.length, 4);
      return Buffer.concat([header, payload]);
    };
    const multiplexed = mkFrame(1, stdoutData);
    const stream = new Readable({ read() {} });
    process.nextTick(() => {
      stream.push(multiplexed);
      stream.push(null);
    });

    const execInstance: any = {
      start: vi.fn().mockResolvedValue(stream),
      inspect: vi.fn().mockResolvedValue({ ExitCode: 1 }),
    };

    const fakeContainer: any = { exec: vi.fn().mockResolvedValue(execInstance), id: 'c2', start: vi.fn().mockResolvedValue(undefined) };
    const mockDocker = { createContainer: vi.fn().mockResolvedValue(fakeContainer) };

    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/proj' });
    const ctx = await driver.provision();

    const res = await driver.exec(ctx, 'false', []);
    expect(res.exitCode).toBe(1);
  });

  it('destroy() calls container.stop() then container.remove()', async () => {
    const calls: string[] = [];
    const fakeContainer: any = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockImplementation(async () => calls.push('stop')),
      remove: vi.fn().mockImplementation(async () => calls.push('remove')),
      id: 'c3',
    };
    const mockDocker = { createContainer: vi.fn().mockResolvedValue(fakeContainer) };
    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/proj' });
    const ctx = await driver.provision();
    await driver.destroy(ctx);
    expect(calls).toEqual(['stop', 'remove']);
    await expect(driver.exec(ctx, 'true', [])).rejects.toThrow(SandboxDestroyedError);
  });

  it('getStatus() returns "running" when container is running and "stopped" when not', async () => {
    const fakeContainer: any = { start: vi.fn().mockResolvedValue(undefined), inspect: vi.fn().mockResolvedValue({ State: { Running: true } }), id: 'c4' };
    const mockDocker = { createContainer: vi.fn().mockResolvedValue(fakeContainer) };
    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host' });
    const ctx = await driver.provision();
    const status = await driver.getStatus(ctx);
    expect(status).toBe('running');

    fakeContainer.inspect.mockResolvedValueOnce({ State: { Running: false } });
    const status2 = await driver.getStatus(ctx);
    expect(status2).toBe('stopped');
  });

  it('provision() throws SandboxProvisionError if docker.createContainer rejects', async () => {
    const mockDocker = { createContainer: vi.fn().mockRejectedValue(new Error('boom')) };
    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/h' });
    await expect(driver.provision()).rejects.toThrow(SandboxProvisionError);
  });
});
