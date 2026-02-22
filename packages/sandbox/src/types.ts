export type SandboxStatus = 'running' | 'stopped' | 'error';

export interface SandboxContext {
  id: string;
  workdir: string;
  status: SandboxStatus;
  createdAt: Date;
  networkId?: string;
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
  egressProxyIp?: string; // optional: IP address of the orchestrator egress proxy
  // Resource limits (optional; validated where required)
  cpuCores: number; // number of CPU cores to allocate
  memoryGb: number; // memory in GB
  pidLimit?: number; // limit on number of PIDs in the container
  nofileLimit?: number; // ulimit nofile value (per-process file descriptor limit)
}
