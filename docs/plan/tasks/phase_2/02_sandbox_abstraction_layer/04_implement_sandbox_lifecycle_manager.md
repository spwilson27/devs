# Task: Implement `SandboxLifecycleManager` — Provisioning, Pre-Flight Injection, and Ephemeral Cleanup Orchestration (Sub-Epic: 02_Sandbox Abstraction Layer)

## Covered Requirements
- [1_PRD-REQ-IMP-001], [1_PRD-REQ-IMP-010], [5_SECURITY_DESIGN-REQ-SEC-SD-045], [TAS-013]

## 1. Initial Test Written

- [ ] In `packages/sandbox/src/__tests__/SandboxLifecycleManager.spec.ts`, write unit tests using a `MockSandboxProvider` (from Task 01) that:

  **Provisioning:**
  - `SandboxLifecycleManager.runInSandbox(task, fn)` calls `provider.provision()` exactly once before invoking `fn`.
  - `fn` receives the provisioned `SandboxContext` as its argument.
  - `runInSandbox()` calls `provider.destroy(ctx)` exactly once in the `finally` block, even if `fn` throws an error.
  - If `provider.provision()` throws `SandboxProvisionError`, `runInSandbox()` propagates the error and does NOT call `destroy()`.

  **Pre-flight injection:**
  - Before invoking `fn`, `runInSandbox()` calls `provider.exec()` with the configured pre-flight commands in order (e.g., setting up environment variables, running `npm install` if a `package.json` pre-flight is configured).
  - If a pre-flight command exits with non-zero, `runInSandbox()` throws `SandboxPreFlightError` and destroys the sandbox.
  - Pre-flight steps are configurable via `SandboxLifecycleConfig.preFlightCommands: Array<{ cmd: string; args: string[] }>`.

  **Ephemeral isolation:**
  - Assert that each call to `runInSandbox()` results in a unique `SandboxContext.id` (fresh sandbox per task, per [5_SECURITY_DESIGN-REQ-SEC-SD-045]).
  - Assert that two sequential calls to `runInSandbox()` do NOT share the same `SandboxContext`.

  **Concurrency guard:**
  - Calling `runInSandbox()` concurrently `N` times provisions `N` separate sandboxes (no shared state between concurrent runs).

  **Timeout:**
  - `SandboxLifecycleConfig.totalTimeoutMs` (default: 300,000 ms) causes `runInSandbox()` to throw `SandboxTimeoutError` and destroy the sandbox if `fn` has not resolved within the limit.

- [ ] Write a test verifying that `SandboxLifecycleManager` emits lifecycle events on an `EventEmitter` or observable:
  - `'sandbox:provisioned'` event is emitted with `SandboxContext` after successful `provision()`.
  - `'sandbox:destroyed'` event is emitted with `{ ctx, reason: 'success' | 'error' | 'timeout' }` after `destroy()`.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/SandboxLifecycleConfig.ts`:
  ```typescript
  export interface PreFlightCommand {
    cmd: string;
    args: string[];
    opts?: ExecOptions;
  }

  export interface SandboxLifecycleConfig {
    preFlightCommands?: PreFlightCommand[];
    totalTimeoutMs?: number; // default: 300_000 (5 minutes)
  }
  ```

- [ ] Create `packages/sandbox/src/SandboxLifecycleManager.ts`:
  ```typescript
  import { EventEmitter } from 'node:events';
  import type { SandboxProvider } from './SandboxProvider';
  import type { SandboxContext } from './types';
  import type { SandboxLifecycleConfig } from './SandboxLifecycleConfig';
  import { SandboxPreFlightError, SandboxTimeoutError } from './errors';

  export class SandboxLifecycleManager extends EventEmitter {
    constructor(
      private readonly provider: SandboxProvider,
      private readonly config: SandboxLifecycleConfig = {}
    ) { super(); }

    async runInSandbox<T>(
      taskLabel: string,
      fn: (ctx: SandboxContext) => Promise<T>
    ): Promise<T> {
      const ctx = await this.provider.provision();
      this.emit('sandbox:provisioned', ctx);
      try {
        await this.runPreFlight(ctx);
        const result = await this.withTimeout(fn(ctx), this.config.totalTimeoutMs ?? 300_000, ctx);
        return result;
      } catch (err) {
        await this.provider.destroy(ctx);
        this.emit('sandbox:destroyed', { ctx, reason: 'error' });
        throw err;
      } finally {
        // destroy is called in catch; for success path, destroy here
        // Note: in a real implementation use a flag to avoid double-destroy
      }
    }

    private async runPreFlight(ctx: SandboxContext): Promise<void> { /* ... */ }
    private async withTimeout<T>(promise: Promise<T>, ms: number, ctx: SandboxContext): Promise<T> { /* ... */ }
  }
  ```
  Implement `runPreFlight` to iterate `config.preFlightCommands`, call `provider.exec()` for each, and throw `SandboxPreFlightError` on non-zero exit codes.
  Implement `withTimeout` using `Promise.race` against a `setTimeout` rejection.

- [ ] Add `SandboxPreFlightError` and `SandboxTimeoutError` to `packages/sandbox/src/errors.ts`.

- [ ] Export `SandboxLifecycleManager` and `SandboxLifecycleConfig` from `packages/sandbox/src/index.ts`.

- [ ] Ensure the lifecycle manager's `runInSandbox` method is the **only** supported way to run code in a sandbox — document this as an architectural constraint. Direct use of `SandboxProvider.exec()` outside of the lifecycle manager is permitted only for testing.

## 3. Code Review

- [ ] Verify that `destroy()` is **always** called after `provision()`, in ALL exit paths (normal return, thrown error, timeout). There must be no code path that skips `destroy()` after a successful `provision()`. Use a `let destroyed = false` guard to prevent double-destroy.
- [ ] Verify that each invocation of `runInSandbox()` is fully independent — no shared mutable state between concurrent invocations.
- [ ] Verify that the `totalTimeoutMs` default (300,000 ms = 5 minutes) is consistent with `[1_PRD-REQ-SEC-010]` (5 min per tool call cap).
- [ ] Verify that lifecycle events (`'sandbox:provisioned'`, `'sandbox:destroyed'`) include enough context (`taskLabel`, `ctx.id`, `reason`) for downstream monitoring and logging.
- [ ] Verify that `runPreFlight` failures are wrapped in `SandboxPreFlightError` with the failing command and exit code included in the error message.
- [ ] Confirm the `EventEmitter` usage does not introduce memory leaks (no persistent listeners added inside the manager itself without removal).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test` and confirm all tests in `SandboxLifecycleManager.spec.ts` pass.
- [ ] Run `pnpm --filter @devs/sandbox build` and confirm `dist/SandboxLifecycleManager.js` and `.d.ts` are generated.
- [ ] Run `tsc --noEmit` inside `packages/sandbox` and confirm zero TypeScript errors.

## 5. Update Documentation

- [ ] Update `packages/sandbox/README.md` to add a "SandboxLifecycleManager" section:
  - Explain the `runInSandbox(taskLabel, fn)` API and its guarantee that `destroy()` is always called.
  - Document `SandboxLifecycleConfig` options with defaults.
  - Document lifecycle events and how to listen for them.
  - Provide a usage example:
    ```typescript
    const manager = new SandboxLifecycleManager(new DockerDriver({ image: 'ghcr.io/devs-project/sandbox-base:alpine-3.19' }), {
      preFlightCommands: [{ cmd: 'npm', args: ['install'] }],
      totalTimeoutMs: 300_000,
    });
    const result = await manager.runInSandbox('run-tests', async (ctx) => {
      return provider.exec(ctx, 'npm', ['test']);
    });
    ```
- [ ] Update `.agent/memory.md` to record: "`SandboxLifecycleManager.runInSandbox()` is the single entry point for all agent task execution. It guarantees: (1) fresh ephemeral sandbox per task, (2) pre-flight command execution, (3) sandbox destruction in all exit paths, (4) 5-minute total timeout. Direct `SandboxProvider.exec()` calls outside this manager are not permitted in production code."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage` and verify line coverage ≥ 90% for `src/SandboxLifecycleManager.ts`.
- [ ] Run the following to confirm destroy-always behavior is present in source:
  ```bash
  grep -q 'finally' packages/sandbox/src/SandboxLifecycleManager.ts && echo "FINALLY BLOCK PRESENT" || echo "MISSING FINALLY — DESTROY NOT GUARANTEED"
  ```
- [ ] Run a concurrency smoke test (can be a simple Node.js script in `packages/sandbox/scripts/concurrency-smoke.ts`):
  ```typescript
  // Provisions 5 sandboxes concurrently; asserts all ctx.id values are unique
  const ids = await Promise.all(Array.from({ length: 5 }, (_, i) => manager.runInSandbox(`task-${i}`, async (ctx) => ctx.id)));
  console.assert(new Set(ids).size === 5, 'All sandbox IDs must be unique');
  console.log('CONCURRENCY SMOKE TEST PASSED');
  ```
  Run with `npx ts-node packages/sandbox/scripts/concurrency-smoke.ts` and confirm output is `CONCURRENCY SMOKE TEST PASSED`.
