export type SandboxStatus = 'running' | 'stopped' | 'error';

export interface SandboxContext {
  id: string;
  workdir: string;
  status: SandboxStatus;
  createdAt: Date;
}

export interface ExecOptions {
  timeoutMs?: number;
  env?: Record<string, string>;
  cwd?: string;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}
