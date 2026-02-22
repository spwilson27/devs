import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

export type LogSinkConfig =
  | { sinkType: "console" }
  | { sinkType: "file"; filePath: string }
  | { sinkType: "custom"; sink: (entry: AuditEntry) => void };

export interface AuditEntry {
  event: "egress_allowed" | "egress_blocked";
  host: string;
  method: string;
  timestampMs: number;
}

export class ConfigValidationError extends Error {}

export class ProxyAuditLogger extends EventEmitter {
  private config: LogSinkConfig;
  private fileStream?: fs.WriteStream;
  private filePath?: string;
  private allowedCount = 0;
  private blockedCount = 0;
  private recentEntries: AuditEntry[] = [];

  constructor(config: LogSinkConfig) {
    super();
    this.config = config;
    if (this.config.sinkType === 'file') {
      if (!this.config.filePath || !path.isAbsolute(this.config.filePath)) {
        throw new ConfigValidationError('filePath must be an absolute path for file sink');
      }
      this.filePath = this.config.filePath;
      // open append-only stream as required
      this.fileStream = fs.createWriteStream(this.filePath, { flags: 'a' });
    } else if (this.config.sinkType === 'custom') {
      if (typeof (this.config as any).sink !== 'function') {
        throw new ConfigValidationError('custom sink must be a function');
      }
    }
  }

  logRequest(params: { host: string; allowed: boolean; method: string; timestampMs: number }): void {
    const entry: AuditEntry = {
      event: params.allowed ? 'egress_allowed' : 'egress_blocked',
      host: params.host,
      method: params.method,
      timestampMs: params.timestampMs,
    };

    if (this.config.sinkType === 'custom') {
      try {
        (this.config as any).sink(entry);
      } catch (e) {
        // swallow errors from sinks to avoid affecting proxy flow
      }
    } else if (this.config.sinkType === 'file') {
      try {
        // Ensure synchronous write for test determinism
        fs.appendFileSync(this.filePath!, JSON.stringify(entry) + '\n', { encoding: 'utf8' });
        // Also write to stream for long-running processes
        try {
          this.fileStream?.write(JSON.stringify(entry) + '\n');
        } catch (_) {}
      } catch (e) {
        // swallow
      }
    } else {
      if (entry.event === 'egress_allowed') {
        console.info(JSON.stringify(entry));
      } else {
        console.warn(JSON.stringify(entry));
      }
    }

    if (entry.event === 'egress_allowed') this.allowedCount++;
    else this.blockedCount++;

    this.recentEntries.push(entry);
    // keep recent entries bounded (5 minutes)
    const cutoffAll = entry.timestampMs - 5 * 60 * 1000;
    this.recentEntries = this.recentEntries.filter(e => e.timestampMs >= cutoffAll);

    // emit metrics for 60s window
    const windowCutoff = entry.timestampMs - 60 * 1000;
    const windowEntries = this.recentEntries.filter(e => e.timestampMs >= windowCutoff);
    const blockedWindow = windowEntries.filter(e => e.event === 'egress_blocked').length;
    const allowedWindow = windowEntries.filter(e => e.event === 'egress_allowed').length;
    this.emit('metrics', { blockedCount: blockedWindow, allowedCount: allowedWindow });
  }

  getMetrics(): { allowedCount: number; blockedCount: number } {
    return { allowedCount: this.allowedCount, blockedCount: this.blockedCount };
  }

  close(): void {
    try {
      this.fileStream?.end();
    } catch (_) {}
  }
}
