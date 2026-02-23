import { EventEmitter } from 'node:events';
import type { SandboxProvider } from './SandboxProvider';
import type { SandboxContext } from './types';
import type { SandboxLifecycleConfig } from './SandboxLifecycleConfig';
import { SandboxPreFlightError, SandboxTimeoutError } from './errors';
import type { TeardownOutcome } from './cleanup/SandboxCleanupService';

export class SandboxLifecycleManager extends EventEmitter {
  constructor(
    private readonly provider: SandboxProvider,
    private readonly config: SandboxLifecycleConfig = {},
    private readonly cleanupService?: { teardown: (sandboxId: string, opts: { outcome: TeardownOutcome }) => Promise<void> }
  ) {
    super();
  }

  async runInSandbox<T>(
    taskLabel: string,
    fn: (ctx: SandboxContext) => Promise<T>
  ): Promise<T> {
    let ctx: SandboxContext | undefined;
    let destroyed = false;
    let exitReason: 'success' | 'error' | 'timeout' = 'success';

    try {
      ctx = await this.provider.provision();
      this.emit('sandbox:provisioned', { taskLabel, ctx });

      await this.runPreFlight(ctx);

      const result = await this.withTimeout(
        fn(ctx),
        this.config.totalTimeoutMs ?? 300_000,
        ctx
      );

      return result;
    } catch (err: any) {
      if (err instanceof SandboxTimeoutError) exitReason = 'timeout';
      else exitReason = 'error';
      throw err;
    } finally {
      if (ctx && !destroyed) {
        try {
          if (this.cleanupService) {
            const outcome: TeardownOutcome = exitReason === 'success' ? 'success' : 'failure';
            await this.cleanupService.teardown(ctx.id, { outcome });
          } else {
            await this.provider.destroy(ctx);
          }
        } catch (destroyErr) {
          // swallow destroy errors - ensure we always emit destroyed event
        } finally {
          destroyed = true;
          this.emit('sandbox:destroyed', { taskLabel, ctx, reason: exitReason });
        }
      }
    }
  }

  private async runPreFlight(ctx: SandboxContext): Promise<void> {
    const cmds = this.config.preFlightCommands ?? [];
    for (const c of cmds) {
      const res = await this.provider.exec(ctx, c.cmd, c.args, (c as any).opts);
      if (res.exitCode !== 0) {
        throw new SandboxPreFlightError(c.cmd, c.args, res.exitCode);
      }
    }
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, _ctx: SandboxContext): Promise<T> {
    if (!ms || ms <= 0) return promise;
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new SandboxTimeoutError(`Sandbox task timed out after ${ms}ms`)), ms);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
