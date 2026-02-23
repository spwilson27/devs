/**
 * SecurityEvent and BreachDetector types for SandboxMonitor
 */

/**
 * SecurityEvent represents a structured security event emitted by SandboxMonitor.
 */
export interface SecurityEvent {
  /** Type of security event */
  eventType: 'BREACH' | 'RESOURCE_EXHAUSTION' | 'NETWORK_VIOLATION';
  /** Sandbox identifier */
  sandboxId: string;
  /** ISO 8601 UTC timestamp */
  timestamp: string; // ISO 8601
  /** Reason for the event */
  reason: string;
  /** PID of the affected process */
  pid: number;
}

/**
 * BreachDetector inspects a ChildProcess and returns a reason string when a breach
 * is detected, otherwise returns null/false.
 */
export type BreachDetector = (
  processHandle: import('child_process').ChildProcess
) => Promise<string | null> | string | null;
