import { describe, it, expect, vi } from 'vitest';
import { execFile } from 'child_process';
import { DockerDriver } from '../DockerDriver';

describe('DockerDriver security hardening', () => {
  it('provision() passes --cap-drop=ALL in HostConfig.CapDrop', async () => {
    let capturedOpts: any;
    const fakeContainer = { id: 'cont-sec-1', start: vi.fn().mockResolvedValue(undefined) };
    const mockDocker = {
      createContainer: vi.fn().mockImplementation((opts) => {
        capturedOpts = opts;
        return Promise.resolve(fakeContainer);
      }),
    };

    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/proj' });
    await driver.provision();
    expect(capturedOpts).toBeDefined();
    expect(capturedOpts.HostConfig.CapDrop).toEqual(['ALL']);
  });

  it('provision() sets SecurityOpt to no-new-privileges:true', async () => {
    let capturedOpts: any;
    const fakeContainer = { id: 'cont-sec-2', start: vi.fn().mockResolvedValue(undefined) };
    const mockDocker = { createContainer: vi.fn().mockImplementation((opts) => { capturedOpts = opts; return Promise.resolve(fakeContainer); }) };
    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/proj' });
    await driver.provision();
    expect(capturedOpts.HostConfig.SecurityOpt).toContain('no-new-privileges:true');
  });

  it('provision() sets PidsLimit to 128', async () => {
    let capturedOpts: any;
    const fakeContainer = { id: 'cont-sec-3', start: vi.fn().mockResolvedValue(undefined) };
    const mockDocker = { createContainer: vi.fn().mockImplementation((opts) => { capturedOpts = opts; return Promise.resolve(fakeContainer); }) };
    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/proj' });
    await driver.provision();
    expect(capturedOpts.HostConfig.PidsLimit).toBe(128);
  });

  it('provision() sets Memory limit (4GB) in HostConfig.Memory', async () => {
    let capturedOpts: any;
    const fakeContainer = { id: 'cont-sec-4', start: vi.fn().mockResolvedValue(undefined) };
    const mockDocker = { createContainer: vi.fn().mockImplementation((opts) => { capturedOpts = opts; return Promise.resolve(fakeContainer); }) };
    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/proj' });
    await driver.provision();
    expect(capturedOpts.HostConfig.Memory).toBe(4 * 1024 * 1024 * 1024);
  });

  it('provision() sets NanoCPUs for 2 CPU cores', async () => {
    let capturedOpts: any;
    const fakeContainer = { id: 'cont-sec-5', start: vi.fn().mockResolvedValue(undefined) };
    const mockDocker = { createContainer: vi.fn().mockImplementation((opts) => { capturedOpts = opts; return Promise.resolve(fakeContainer); }) };
    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/proj' });
    await driver.provision();
    expect(capturedOpts.HostConfig.NanoCPUs).toBe(2 * 1e9);
  });

  it('provision() sets ReadonlyRootfs to false but mounts workspace as rw', async () => {
    let capturedOpts: any;
    const fakeContainer = { id: 'cont-sec-6', start: vi.fn().mockResolvedValue(undefined) };
    const mockDocker = { createContainer: vi.fn().mockImplementation((opts) => { capturedOpts = opts; return Promise.resolve(fakeContainer); }) };
    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/proj' });
    await driver.provision();
    expect(capturedOpts.HostConfig.ReadonlyRootfs).toBe(false);
    expect(capturedOpts.HostConfig.Binds).toContain('/host/proj:/workspace:rw');
  });

  it('provision() does not pass --privileged', async () => {
    let capturedOpts: any;
    const fakeContainer = { id: 'cont-sec-7', start: vi.fn().mockResolvedValue(undefined) };
    const mockDocker = { createContainer: vi.fn().mockImplementation((opts) => { capturedOpts = opts; return Promise.resolve(fakeContainer); }) };
    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/proj' });
    await driver.provision();
    expect(capturedOpts.HostConfig.Privileged).toBe(false);
  });

  it('provision() sets NetworkMode to none by default', async () => {
    let capturedOpts: any;
    const fakeContainer = { id: 'cont-sec-8', start: vi.fn().mockResolvedValue(undefined) };
    const mockDocker = { createContainer: vi.fn().mockImplementation((opts) => { capturedOpts = opts; return Promise.resolve(fakeContainer); }) };
    const driver = new DockerDriver(mockDocker as any, { hostProjectPath: '/host/proj' });
    await driver.provision();
    expect(capturedOpts.HostConfig.NetworkMode).toBe('none');
  });

  it('@integration running container cannot gain new privileges', async () => {
    // This integration test requires Docker and the base image to be available. It is tagged and run separately.
    const res = await new Promise<string>((resolve, reject) => {
      execFile('docker', ['run', '--rm', '--security-opt', 'no-new-privileges:true', 'devs-sandbox-base:latest', 'sh', '-c', 'cat /proc/self/status | grep NoNewPrivs'], (err, stdout) => {
        if (err) return reject(err);
        resolve(stdout ?? '');
      });
    });
    expect(res).toContain('NoNewPrivs:\t1');
  });
});
