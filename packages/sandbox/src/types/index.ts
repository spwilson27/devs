/**
 * Represents the result of a sandbox command execution.
 * Implemented by concrete drivers (e.g., process or container drivers).
 */
export interface SandboxExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Options used to provision a sandbox environment.
 * Implemented/used by provisioning workflows and Drivers.
 */
export interface SandboxProvisionOptions {
  workdir: string;
  env?: Record<string, string>;
  timeoutMs?: number;
}
