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

export interface SandboxConfig {
  hostProjectPath: string; // absolute path to the project on the host; must not be empty
  workspaceMount?: string; // defaults to '/workspace'
  tmpfsSize?: string; // defaults to '256m'
}
