import type { SandboxConfig } from './types';

export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  hostProjectPath: process.cwd(),
  workspaceMount: '/workspace',
  tmpfsSize: '256m',
  cpuCores: 2,
  memoryGb: 4,
  storageLimitGb: 2,
  pidLimit: 512,
  nofileLimit: 1024,
};
