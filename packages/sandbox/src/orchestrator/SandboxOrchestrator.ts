import crypto from 'crypto';
import { HARDENED_BASE_IMAGE } from '../constants';

export interface RunTaskOptions {
  projectRoot?: string;
  mcpConfig?: any;
  secrets?: Record<string, string>;
  agentEntrypoint?: string | string[];
}

export interface TaskResult {
  success: boolean;
  sandboxId: string;
  result?: any;
  error?: any;
}

export class SandboxOrchestrator {
  private provider: any;
  private preflight: any;
  private cleanup: any;
  private sessionKeyManager: any;
  private secretInjector: any;
  private environmentSanitizer: any;

  constructor(opts: {
    provider: any;
    preflight: any;
    cleanup: any;
    sessionKeyManager: any;
    secretInjector: any;
    environmentSanitizer: any;
  }) {
    this.provider = opts.provider;
    this.preflight = opts.preflight;
    this.cleanup = opts.cleanup;
    this.sessionKeyManager = opts.sessionKeyManager;
    this.secretInjector = opts.secretInjector;
    this.environmentSanitizer = opts.environmentSanitizer;
  }

  async runTask(task: any, opts: RunTaskOptions = {}): Promise<TaskResult> {
    let sandboxId = crypto.randomUUID();
    const env = this.environmentSanitizer?.sanitize ? this.environmentSanitizer.sanitize(process.env) : {};

    // Create or provision sandbox
    try {
      if (typeof this.provider.create === 'function') {
        await this.provider.create(sandboxId, { image: HARDENED_BASE_IMAGE, env });
      } else if (typeof this.provider.provision === 'function') {
        const ctx = await this.provider.provision();
        if (ctx?.id) sandboxId = ctx.id;
      } else {
        throw new Error('SandboxProvider does not support create or provision');
      }
    } catch (e: any) {
      try { console.info(JSON.stringify({ event: 'sandbox_created', sandboxId, created: false, error: String(e) })); } catch (_) {}
      return { success: false, sandboxId, error: e };
    }

    try { console.info(JSON.stringify({ event: 'sandbox_created', sandboxId })); } catch (_) {}

    let outcome: 'success' | 'failure' = 'failure';
    let execResult: any = undefined;

    try {
      // Generate and register session key
      let keyBuf: Buffer | undefined;
      if (typeof this.sessionKeyManager?.generateKey === 'function') {
        keyBuf = this.sessionKeyManager.generateKey();
      } else {
        keyBuf = Buffer.from(crypto.randomBytes(16));
      }
      if (typeof this.sessionKeyManager?.registerKey === 'function') {
        await this.sessionKeyManager.registerKey(sandboxId, keyBuf);
      }

      // Run preflight
      await this.preflight.runPreflight(sandboxId, { projectRoot: opts.projectRoot, task, mcpConfig: opts.mcpConfig });
      try { console.info(JSON.stringify({ event: 'preflight_complete', sandboxId })); } catch (_) {}

      // Inject secrets (including session key)
      const mergedSecrets = { ...(opts.secrets ?? {}), DEVS_SESSION_KEY: keyBuf?.toString('hex') ?? '' };
      if (typeof this.secretInjector?.inject === 'function') {
        await this.secretInjector.inject(sandboxId, mergedSecrets);
      }

      // Execute workload
      if (typeof this.provider.exec === 'function') {
        execResult = await this.provider.exec(sandboxId, opts.agentEntrypoint ?? []);
      } else {
        execResult = { success: false };
      }

      try { console.info(JSON.stringify({ event: 'execution_complete', sandboxId, success: !!execResult?.success })); } catch (_ ) {}

      outcome = execResult?.success ? 'success' : 'failure';
      return { success: !!execResult?.success, sandboxId, result: execResult };
    } catch (err: any) {
      outcome = 'failure';
      return { success: false, sandboxId, error: err };
    } finally {
      try {
        await this.cleanup.teardown(sandboxId, { outcome });
      } catch (e) {
        // swallow cleanup errors
      }
      try {
        if (typeof this.sessionKeyManager?.revokeKey === 'function') {
          await this.sessionKeyManager.revokeKey(sandboxId);
        }
      } catch (e) {
        // swallow revoke errors
      }
      try { console.info(JSON.stringify({ event: 'sandbox_torn_down', sandboxId, outcome })); } catch (_) {}
    }
  }
}

export default SandboxOrchestrator;
