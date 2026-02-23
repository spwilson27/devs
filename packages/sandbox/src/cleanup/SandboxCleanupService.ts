import type { SandboxProvider } from '../SandboxProvider';
import { VolumeManager } from './VolumeManager';

export type TeardownOutcome = 'success' | 'failure';

export class SandboxCleanupService {
  private registry = new Map<string, 'RUNNING' | 'DESTROYED' | 'PRESERVED'>();

  constructor(
    private readonly sandboxProvider: SandboxProvider,
    private readonly shellExecutor: { exec: (cmd: string, args?: string[]) => Promise<{ stdout?: string; stderr?: string; exitCode?: number }> },
    private readonly volumeManager: VolumeManager,
    private readonly logger: { warn: (msg: any) => void; info: (msg: any) => void } = console
  ) {}

  registerSandbox(sandboxId: string) {
    this.registry.set(sandboxId, 'RUNNING');
  }

  getSandboxState(sandboxId: string) {
    return this.registry.get(sandboxId);
  }

  async teardown(sandboxId: string, opts: { outcome: TeardownOutcome }): Promise<void> {
    const state = this.registry.get(sandboxId);
    // Idempotency: if we've never registered this sandbox and success outcome, treat as noop
    if (!state && opts.outcome === 'success') return;

    if (opts.outcome === 'success') {
      const ctx: any = { id: sandboxId } as any;
      try {
        if (typeof (this.sandboxProvider as any).destroy === 'function') {
          await (this.sandboxProvider as any).destroy(ctx);
        } else {
          // Fallback to shell-based removal for drivers that don't implement destroy
          await this.shellExecutor.exec('docker', ['rm', '-f', sandboxId]);
        }
      } finally {
        // Ensure ephemeral volumes are removed and registry cleaned up
        try {
          await this.volumeManager.removeEphemeralVolumes(sandboxId);
        } catch (e) {
          // swallow errors during volume cleanup
        }
        this.registry.delete(sandboxId);
      }
    } else {
      // Failure path: stop container but preserve it for debugging
      const ctx: any = { id: sandboxId } as any;
      if (typeof (this.sandboxProvider as any).stop === 'function') {
        try {
          await (this.sandboxProvider as any).stop(ctx);
        } catch (e) {
          // ignore stop errors
        }
      } else {
        try {
          await this.shellExecutor.exec('docker', ['stop', sandboxId]);
        } catch (e) {
          // ignore
        }
      }

      this.registry.set(sandboxId, 'PRESERVED');
      try {
        // Emit structured warning for monitoring/observability
        this.logger.warn(JSON.stringify({ event: 'sandbox_preserved', sandboxId, reason: 'task_failure', preserved_for_debugging: true }));
      } catch (e) {
        // ignore logging errors
      }
    }
  }

  async deepPurge(sandboxId: string): Promise<void> {
    try {
      // Use docker-compose project scoping to remove services and anonymous volumes
      await this.shellExecutor.exec('docker-compose', ['-p', sandboxId, 'down', '-v']);
    } catch (e) {
      // swallow errors from compose down
    }
    try {
      await this.volumeManager.removeEphemeralVolumes(sandboxId);
    } catch (e) {
      // ignore
    }
    try {
      this.logger.info(JSON.stringify({ event: 'deep_purge_complete', sandboxId }));
    } catch (e) {
      // ignore
    }
  }
}

export default SandboxCleanupService;
