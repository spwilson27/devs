import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { rm } from 'fs/promises';
import os from 'os';
import path from 'path';

export const SANDBOX_EVENTS = {
  OOM: 'sandbox:oom',
  DISK_QUOTA: 'sandbox:disk_quota',
  CLEANUP_COMPLETE: 'sandbox:cleanup_complete',
} as const;

export class ResourceExhaustionHandler extends EventEmitter {
  private driver: any;

  constructor(driver: { isRunning: (id: string) => Promise<boolean>; forceStop: (id: string) => Promise<void>; }) {
    super();
    this.driver = driver;
  }

  async onOomKill(containerId: string): Promise<void> {
    this.emit(SANDBOX_EVENTS.OOM, { containerId, timestamp: Date.now() });
    try {
      if (await this.driver.isRunning(containerId)) {
        await this.driver.forceStop(containerId);
      }
    } catch (err) {
      // swallow driver errors
    }
    await this.cleanupEphemeralArtifacts(containerId);
    this.emit(SANDBOX_EVENTS.CLEANUP_COMPLETE, { containerId, cleanedAt: Date.now() });
  }

  async onDiskQuotaExceeded(containerId: string): Promise<void> {
    this.emit(SANDBOX_EVENTS.DISK_QUOTA, { containerId, timestamp: Date.now() });
    await this.cleanupEphemeralArtifacts(containerId);
    this.emit(SANDBOX_EVENTS.CLEANUP_COMPLETE, { containerId, cleanedAt: Date.now() });
  }

  async cleanupEphemeralArtifacts(containerId: string): Promise<void> {
    // attempt to remove the container; swallow any errors
    await new Promise<void>((resolve) => {
      try {
        const child = spawn('docker', ['rm', '-f', containerId]);
        let settled = false;
        const settle = () => {
          if (!settled) {
            settled = true;
            resolve();
          }
        };
        child.on('error', settle);
        child.on('close', settle);
        // fallback: resolve on next tick to avoid hanging if the child isn't an EventEmitter
        setImmediate(settle);
      } catch (err) {
        resolve();
      }
    });

    const tmpDir = path.join(os.tmpdir(), `devs-sandbox-${containerId}`);
    try {
      await rm(tmpDir, { recursive: true, force: true });
    } catch (err) {
      // swallow fs errors
    }
  }
}
