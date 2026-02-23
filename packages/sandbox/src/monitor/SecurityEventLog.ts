import { SecurityEvent } from './types';

/** In-memory ring buffer for SecurityEvent objects */
class SecurityEventLogClass {
  private buffer: SecurityEvent[] = [];
  private readonly maxEntries = 1000;

  append(evt: SecurityEvent) {
    if (this.buffer.length >= this.maxEntries) {
      this.buffer.shift();
    }
    this.buffer.push(evt);
  }

  getAll(): SecurityEvent[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer = [];
  }
}

export const SecurityEventLog = new SecurityEventLogClass();
