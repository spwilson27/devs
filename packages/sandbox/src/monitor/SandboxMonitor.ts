import { EventEmitter } from 'events';
import { ChildProcess } from 'child_process';
import { BreachDetector, SecurityEvent } from './types';
import { SandboxStateManager } from './SandboxStateManager';
import { SecurityEventLog } from './SecurityEventLog';

export interface SandboxMonitorConfig {
  pollIntervalMs?: number;
  sandboxId: string;
  processHandle: ChildProcess;
  detectors?: BreachDetector[];
}

export class SandboxMonitor extends EventEmitter {
  private config: Required<Pick<SandboxMonitorConfig, 'pollIntervalMs' | 'sandboxId' | 'processHandle'>> & { detectors: BreachDetector[] };
  private intervalId: NodeJS.Timeout | null = null;
  private _breachHandled = false;

  constructor(config: SandboxMonitorConfig) {
    super();
    this.config = {
      pollIntervalMs: config.pollIntervalMs ?? 1000,
      sandboxId: config.sandboxId,
      processHandle: config.processHandle,
      detectors: config.detectors ?? [],
    } as any;
  }

  start(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      void (this as any)._checkForBreach();
    }, this.config.pollIntervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async _checkForBreach(): Promise<void> {
    if (this._breachHandled) return;
    for (const d of this.config.detectors) {
      try {
        const res = await d(this.config.processHandle);
        if (res) {
          this._handleBreach(typeof res === 'string' ? res : String(res));
          return;
        }
      } catch (e) {
        // ignore detector errors
      }
    }
  }

  _handleBreach(reason: string): void {
    if (this._breachHandled) return;
    this._breachHandled = true;
    try {
      // Ensure immediate termination on breach
      this.config.processHandle.kill('SIGKILL' as any);
    } catch (e) {
      // ignore kill errors
    }
    SandboxStateManager.setState('SECURITY_PAUSE');
    const evt: SecurityEvent = {
      eventType: 'BREACH',
      sandboxId: this.config.sandboxId,
      timestamp: new Date().toISOString(),
      reason,
      pid: (this.config.processHandle as any).pid ?? -1,
    };
    this.emit('breach', evt);
    SecurityEventLog.append(evt);
  }
}
