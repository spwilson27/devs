import type { ExecOptions } from './types';

export interface PreFlightCommand {
  cmd: string;
  args: string[];
  opts?: ExecOptions;
}

export interface SandboxLifecycleConfig {
  preFlightCommands?: PreFlightCommand[];
  /** total timeout in milliseconds (default: 300_000 = 5 minutes) */
  totalTimeoutMs?: number;
}
