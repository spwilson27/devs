import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SandboxCleanupService, TeardownOutcome } from '../cleanup/SandboxCleanupService';
import { VolumeManager } from '../cleanup/VolumeManager';

describe('SandboxCleanupService', () => {
  let provider: any;
  let shellExec: any;
  let volumeManager: VolumeManager;
  let logger: any;
  let svc: SandboxCleanupService;

  beforeEach(() => {
    provider = { destroy: vi.fn(async (ctx: any) => {}), /* no stop method */ };
    shellExec = { exec: vi.fn(async () => ({ stdout: '', stderr: '', exitCode: 0 })) };
    volumeManager = new VolumeManager();
    logger = { warn: vi.fn(), info: vi.fn() };
    svc = new SandboxCleanupService(provider, shellExec, volumeManager, logger as any);
  });

  it('teardown success calls provider.destroy, removes volumes and registry entry', async () => {
    const id = 'sb-success-1';
    svc.registerSandbox(id);
    const spyVol = vi.spyOn(volumeManager as any, 'removeEphemeralVolumes');
    await svc.teardown(id, { outcome: 'success' });
    expect(provider.destroy).toHaveBeenCalled();
    expect(spyVol).toHaveBeenCalledWith(id);
    expect(svc.getSandboxState(id)).toBeUndefined();
  });

  it('teardown failure does not call destroy, stops container and emits structured log', async () => {
    const id = 'sb-fail-1';
    svc.registerSandbox(id);
    await svc.teardown(id, { outcome: 'failure' });
    expect(provider.destroy).not.toHaveBeenCalled();
    expect(shellExec.exec).toHaveBeenCalledWith('docker', ['stop', id]);
    expect(logger.warn).toHaveBeenCalled();
    const arg = JSON.parse((logger.warn as any).mock.calls[0][0]);
    expect(arg.sandboxId).toBe(id);
    expect(arg.preserved_for_debugging).toBe(true);
  });

  it('deepPurge calls docker-compose down -v and removes ephemeral volumes and emits log', async () => {
    const id = 'sb-deep-1';
    const spyVol = vi.spyOn(volumeManager as any, 'removeEphemeralVolumes');
    await svc.deepPurge(id);
    expect(shellExec.exec).toHaveBeenCalledWith('docker-compose', ['-p', id, 'down', '-v']);
    expect(spyVol).toHaveBeenCalledWith(id);
    expect(logger.info).toHaveBeenCalled();
    const arg = JSON.parse((logger.info as any).mock.calls[0][0]);
    expect(arg.event).toBe('deep_purge_complete');
  });

  it('teardown idempotency: calling success teardown twice is a no-op second time', async () => {
    const id = 'sb-idemp-1';
    svc.registerSandbox(id);
    await svc.teardown(id, { outcome: 'success' });
    expect(provider.destroy).toHaveBeenCalledTimes(1);
    // second call should not throw and should not call destroy again
    await svc.teardown(id, { outcome: 'success' });
    expect(provider.destroy).toHaveBeenCalledTimes(1);
  });

  // Integration tests with real docker are intentionally omitted/skipped in CI environment.
});
