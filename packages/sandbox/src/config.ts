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

export const SANDBOX_PATHS = {
  workspace: '/workspace',
  devsDir: '/workspace/.devs',
  taskManifest: '/workspace/.devs/task.json',
  mcpConfig: '/workspace/.devs/mcp_config.json',
} as const;

export type SandboxPaths = typeof SANDBOX_PATHS;
