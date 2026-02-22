/**
 * Provider-specific types for the Sandbox abstraction.
 */

import type { SandboxExecResult, SandboxProvisionOptions } from '../types';

export type { SandboxExecResult, SandboxProvisionOptions };

export interface SandboxContext {
  id: string;
  workdir: string;
  createdAt: string;
}

export interface ExecOptions {
  env?: Record<string, string>;
  timeoutMs?: number;
  stdin?: string;
}

export type ExecResult = SandboxExecResult;

export interface ResourceStats {
  cpuPercent: number;
  memoryBytes: number;
  timestamp: string;
}
