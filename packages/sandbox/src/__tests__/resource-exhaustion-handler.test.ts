import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.mock('child_process', () => ({ spawn: vi.fn() }));
vi.mock('fs/promises', () => ({ rm: vi.fn() }));
import * as child_process from 'child_process';
import * as fsPromises from 'fs/promises';
import os from 'os';
import path from 'path';
import { EventEmitter } from 'events';
import { ResourceExhaustionHandler, SANDBOX_EVENTS } from '../handlers/resource-exhaustion-handler';

describe('ResourceExhaustionHandler', () => {
  let driver: any;
  let handler: ResourceExhaustionHandler;

  beforeEach(() => {
    driver = {
      isRunning: vi.fn().mockResolvedValue(true),
      forceStop: vi.fn().mockResolvedValue(undefined),
    };
    handler = new ResourceExhaustionHandler(driver);
    // clear any mocked call counts on fs.rm
    (fsPromises as any).rm?.mockClear?.();
    // clear child process mock as well
    (child_process as any).spawn?.mockClear?.();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('onOomKill emits sandbox:oom and calls forceStop if running, cleans up and emits cleanup_complete', async () => {
    const oomSpy = vi.fn();
    const cleanupSpy = vi.fn();
    handler.on(SANDBOX_EVENTS.OOM, oomSpy);
    handler.on(SANDBOX_EVENTS.CLEANUP_COMPLETE, cleanupSpy);

    // mock spawn to simulate immediate close
    const fakeChild = new EventEmitter();
    (child_process as any).spawn.mockReturnValue(fakeChild as any);
    // ensure fs.rm succeeds
    const rmSpy = (fsPromises as any).rm.mockResolvedValue(undefined as any);

    const promise = handler.onOomKill('cid123');
    // simulate child close
    (fakeChild as any).emit('close', 0);
    await promise;

    expect(oomSpy).toHaveBeenCalledWith(expect.objectContaining({ containerId: 'cid123' }));
    expect(driver.isRunning).toHaveBeenCalledWith('cid123');
    expect(driver.forceStop).toHaveBeenCalledWith('cid123');
    expect(rmSpy).toHaveBeenCalledWith(path.join(os.tmpdir(), 'devs-sandbox-cid123'), { recursive: true, force: true });
    expect(cleanupSpy).toHaveBeenCalledWith(expect.objectContaining({ containerId: 'cid123' }));
  });

  it('onDiskQuotaExceeded emits disk_quota and performs cleanup', async () => {
    const diskSpy = vi.fn();
    const cleanupSpy = vi.fn();
    handler.on(SANDBOX_EVENTS.DISK_QUOTA, diskSpy);
    handler.on(SANDBOX_EVENTS.CLEANUP_COMPLETE, cleanupSpy);

    const fakeChild = new EventEmitter();
    (child_process as any).spawn.mockReturnValue(fakeChild as any);
    const rmSpy = (fsPromises as any).rm.mockResolvedValue(undefined as any);

    const p = handler.onDiskQuotaExceeded('cid-disk');
    (fakeChild as any).emit('close', 1);
    await p;

    expect(diskSpy).toHaveBeenCalledWith(expect.objectContaining({ containerId: 'cid-disk' }));
    expect(rmSpy).toHaveBeenCalled();
    expect(cleanupSpy).toHaveBeenCalled();
  });

  it('cleanupEphemeralArtifacts is idempotent and swallows docker errors', async () => {
    const fakeChild = new EventEmitter();
    (child_process as any).spawn.mockReturnValue(fakeChild as any);
    const rmSpy = (fsPromises as any).rm.mockResolvedValue(undefined as any);

    const p1 = handler.cleanupEphemeralArtifacts('cid-x');
    // simulate error
    (fakeChild as any).emit('error', new Error('not found'));
    await p1;
    expect(rmSpy).toHaveBeenCalled();

    // second call where child closes with non-zero
    const fakeChild2 = new EventEmitter();
    (child_process as any).spawn.mockReturnValue(fakeChild2 as any);
    const p2 = handler.cleanupEphemeralArtifacts('cid-x');
    (fakeChild2 as any).emit('close', 137);
    await p2;
    expect(rmSpy).toHaveBeenCalledTimes(2);
  });
});
