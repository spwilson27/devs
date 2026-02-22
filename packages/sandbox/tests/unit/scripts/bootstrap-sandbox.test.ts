import child_process from 'child_process';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { bootstrapSandbox, SandboxBootstrapError } from '../../../src/scripts/bootstrap-sandbox';

const ORIGINAL_NODE_VERSION = process.version;

afterEach(() => {
  vi.restoreAllMocks();
  try {
    Object.defineProperty(process, 'version', { value: ORIGINAL_NODE_VERSION });
  } catch (e) {
    // ignore
  }
});

describe('bootstrapSandbox (unit)', () => {
  it('invokes docker info for docker driver and returns BootstrapResult', async () => {
    const spy = vi.spyOn(child_process, 'execSync').mockImplementation(() => Buffer.from('OK') as any);
    const res = await bootstrapSandbox({ driver: 'docker' });
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('docker info', expect.objectContaining({ stdio: 'pipe' }));
    expect(res).toEqual(expect.objectContaining({ driver: 'docker', ready: true }));
    expect(typeof res.durationMs).toBe('number');
    expect(res.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('throws SandboxBootstrapError when docker info fails', async () => {
    vi.spyOn(child_process, 'execSync').mockImplementation(() => { throw new Error('no docker'); });
    await expect(bootstrapSandbox({ driver: 'docker' })).rejects.toThrowError(SandboxBootstrapError);
    await expect(bootstrapSandbox({ driver: 'docker' })).rejects.toThrow(/Docker daemon is not running/);
  });

  it('throws SandboxBootstrapError for webcontainer when Node < 22', async () => {
    Object.defineProperty(process, 'version', { value: 'v20.0.0' });
    await expect(bootstrapSandbox({ driver: 'webcontainer' })).rejects.toThrowError(SandboxBootstrapError);
  });

  it('returns BootstrapResult for webcontainer when Node >= 22', async () => {
    Object.defineProperty(process, 'version', { value: 'v22.0.0' });
    const res = await bootstrapSandbox({ driver: 'webcontainer' });
    expect(res).toEqual(expect.objectContaining({ driver: 'webcontainer', ready: true }));
    expect(typeof res.durationMs).toBe('number');
    expect(res.durationMs).toBeGreaterThanOrEqual(0);
  });
});
