import { SANDBOX_PATHS } from '../config';
import type { SandboxProvider } from '../providers';
import type { FilesystemManager } from '../filesystem';
import { PreflightError } from './PreflightError';
import { SecretInjector } from '../secrets/SecretInjector';
import { sessionKeyManager } from '../keys/SessionKeyManager';
import type { TaskManifest, McpConfig, PreflightOptions } from '../types';

export class PreflightService {
  constructor(private provider: SandboxProvider, private fsManager: FilesystemManager) {}

  async injectCodebase(sandboxId: string, projectRootPath: string): Promise<void> {
    try {
      await this.fsManager.sync(projectRootPath, sandboxId, { exclude: ['.git', '.devs'] });
    } catch (err: any) {
      throw new PreflightError(`Failed to inject codebase: ${err?.message ?? String(err)}`, sandboxId, 'injectCodebase');
    }
  }

  async injectTaskRequirements(sandboxId: string, task: TaskManifest): Promise<void> {
    const ctx = { id: sandboxId, workdir: SANDBOX_PATHS.workspace, status: 'running', createdAt: new Date() } as any;
    const json = JSON.stringify(task, null, 2);
    try {
      await this.provider.execWithStdin(ctx, 'sh', ['-lc', `mkdir -p ${SANDBOX_PATHS.devsDir} && cat > ${SANDBOX_PATHS.taskManifest}`], json);
    } catch (err: any) {
      throw new PreflightError(`Failed to inject task requirements: ${err?.message ?? String(err)}`, sandboxId, 'injectTaskRequirements');
    }
  }

  async injectMcpTools(sandboxId: string, mcpConfig: McpConfig): Promise<void> {
    const ctx = { id: sandboxId, workdir: SANDBOX_PATHS.workspace, status: 'running', createdAt: new Date() } as any;
    const json = JSON.stringify(mcpConfig, null, 2);
    try {
      await this.provider.execWithStdin(ctx, 'sh', ['-lc', `mkdir -p ${SANDBOX_PATHS.devsDir} && cat > ${SANDBOX_PATHS.mcpConfig}`], json);
    } catch (err: any) {
      throw new PreflightError(`Failed to inject MCP tools: ${err?.message ?? String(err)}`, sandboxId, 'injectMcpTools');
    }
  }

  async runPreflight(sandboxId: string, opts: PreflightOptions): Promise<void> {
    try {
      await this.injectCodebase(sandboxId, opts.projectRoot);
      await this.injectTaskRequirements(sandboxId, opts.task);
      await this.injectMcpTools(sandboxId, opts.mcpConfig);

      const ctx = { id: sandboxId, workdir: SANDBOX_PATHS.workspace, status: 'running', createdAt: new Date() } as any;
      if ((opts as any)?.secrets) {
        // Generate and register an ephemeral 128-bit session key
        const key = sessionKeyManager.generateKey();
        try {
          sessionKeyManager.registerKey(sandboxId, key);
        } catch (err: any) {
          throw new PreflightError(`Failed to register session key: ${err?.message ?? String(err)}`, sandboxId, 'session_key_registration');
        }
        const mergedSecrets = { ...(opts as any).secrets, DEVS_SESSION_KEY: key.toString('hex') } as any;
        const injector = new SecretInjector(this.provider);
        try {
          await injector.inject(sandboxId, mergedSecrets, 'ephemeral_file');
        } catch (err: any) {
          // Revoke key immediately on injection failure
          try { sessionKeyManager.revokeKey(sandboxId); } catch (_) {}
          throw err;
        }
      }
      await this.provider.exec(ctx, 'sh', ['-lc', 'echo preflight-ready']);
    } catch (err: any) {
      if (err instanceof PreflightError) throw err;
      throw new PreflightError(err?.message ?? String(err), sandboxId, 'runPreflight');
    }
  }
}
