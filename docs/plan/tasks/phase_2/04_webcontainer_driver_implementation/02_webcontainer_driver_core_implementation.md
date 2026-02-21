# Task: WebContainerDriver Core Implementation – Lifecycle & SandboxProvider Contract (Sub-Epic: 04_WebContainer Driver Implementation)

## Covered Requirements
- [2_TAS-REQ-026]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/drivers/webcontainer/__tests__/webcontainer-driver.unit.test.ts`, write unit tests using `jest.mock('@webcontainer/api')`:
  - Test `WebContainerDriver.boot()`:
    - Assert it calls `WebContainer.boot()` exactly once.
    - Assert it resolves with `void` on success.
    - Assert it throws `SandboxBootError` if `WebContainer.boot()` rejects.
  - Test `WebContainerDriver.exec(command, args, options)`:
    - Assert it calls `webcontainer.spawn(command, args)` with correct arguments.
    - Assert it returns a `ProcessHandle` with `stdout`, `stderr` (readable streams) and `exitCode` (promise).
    - Assert it throws `SandboxExecError` if the spawn call rejects.
    - Assert that if `options.timeoutMs` is set (default: 300,000 ms), the process is killed via `process.kill()` after the timeout and `exitCode` rejects with `SandboxTimeoutError`.
  - Test `WebContainerDriver.teardown()`:
    - Assert it calls `webcontainer.teardown()` exactly once.
    - Assert it resolves with `void` on success.
    - Assert it is idempotent (calling twice does not throw).
  - Test `WebContainerDriver` implements `SandboxProvider` interface by confirming the instance satisfies `instanceof SandboxProvider` (or duck-type check on required method signatures).
- [ ] In `packages/sandbox/src/drivers/webcontainer/__tests__/webcontainer-driver.integration.test.ts`, write integration tests (marked `@group integration`, skipped in unit CI):
  - Boot a real WebContainer instance.
  - Exec `echo hello` and assert stdout stream emits `'hello\n'` and exit code is `0`.
  - Exec a non-existent command and assert `SandboxExecError` is thrown.
  - Call `teardown()` and assert subsequent `exec()` calls throw `SandboxTeardownError`.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/drivers/webcontainer/webcontainer-driver.ts` implementing the `SandboxProvider` abstract class from `packages/sandbox/src/sandbox-provider.ts` (defined in Sub-Epic 02).
  - Constructor accepts `WebContainerDriverOptions`:
    ```ts
    interface WebContainerDriverOptions {
      defaultTimeoutMs?: number;   // default 300_000 (5 min)
      workdirPath?: string;        // default '/workspace'
    }
    ```
  - `private _wc: WebContainer | null = null` — internal WebContainer instance.
  - `private _booted = false` — guard flag.
  - `async boot(): Promise<void>`:
    - Calls `WebContainer.boot()` from `@webcontainer/api`.
    - Sets `this._wc` and `this._booted = true`.
    - Wraps errors in `SandboxBootError`.
  - `async exec(command: string, args: string[], options?: ExecOptions): Promise<ProcessHandle>`:
    - Guards that `_booted` is true; throws `SandboxNotBootedError` otherwise.
    - Calls `this._wc!.spawn(command, args)`.
    - Wraps the WebContainer `WebContainerProcess` in the shared `ProcessHandle` type:
      ```ts
      interface ProcessHandle {
        stdout: ReadableStream<string>;
        stderr: ReadableStream<string>;
        exitCode: Promise<number>;
        kill: () => void;
      }
      ```
    - Implements timeout: uses `AbortSignal.timeout(options?.timeoutMs ?? this._options.defaultTimeoutMs)` to kill the process and reject `exitCode` with `SandboxTimeoutError`.
  - `async teardown(): Promise<void>`:
    - Guards idempotency with `this._booted` flag.
    - Calls `this._wc!.teardown()`.
    - Sets `this._wc = null` and `this._booted = false`.
    - Wraps errors in `SandboxTeardownError`.
- [ ] Add all new error types (`SandboxBootError`, `SandboxExecError`, `SandboxTimeoutError`, `SandboxNotBootedError`, `SandboxTeardownError`) to `packages/sandbox/src/drivers/webcontainer/errors.ts` (created in task 01), each extending the base `SandboxError` class.
- [ ] Export `WebContainerDriver` and `WebContainerDriverOptions` from `packages/sandbox/src/index.ts`.
- [ ] Add `WebContainerDriver` to the driver registry in `packages/sandbox/src/driver-registry.ts` under the key `'webcontainer'`.

## 3. Code Review
- [ ] Confirm `WebContainerDriver` fully satisfies the `SandboxProvider` abstract class contract — no unimplemented abstract methods.
- [ ] Confirm timeout logic uses `AbortSignal` (not `setTimeout` raw calls) so it integrates cleanly with Node.js cancellation patterns.
- [ ] Confirm the `teardown()` idempotency guard prevents double-teardown errors in normal and error-path flows.
- [ ] Confirm `ProcessHandle.stderr` is always populated — WebContainer processes that merge stderr into stdout must be split or a no-op empty stream provided.
- [ ] Confirm no `console.log`/`console.error` calls exist in production code; all logging must go through the shared `@devs/logger` package.
- [ ] Confirm `WebContainerDriverOptions` has JSDoc on every field including units (e.g., `/** Timeout in milliseconds. Default: 300000 (5 minutes). */`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern=webcontainer-driver.unit` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/sandbox tsc --noEmit` and confirm zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/sandbox lint` and confirm zero lint violations.

## 5. Update Documentation
- [ ] Add `WebContainerDriver` API reference to `packages/sandbox/README.md` under a `## Drivers` section, including a code snippet showing boot → exec → teardown lifecycle.
- [ ] Update `docs/decisions/phase_2_adr.md` with ADR entry "ADR-WC-002: WebContainerDriver Timeout Strategy" documenting the use of `AbortSignal.timeout` and the 5-minute default.
- [ ] Update agent memory file `.agent/phase_2_decisions.md` with: "WebContainerDriver implements SandboxProvider; uses AbortSignal.timeout for exec timeouts; registered under key 'webcontainer' in driver-registry."

## 6. Automated Verification
- [ ] CI step: `pnpm --filter @devs/sandbox test -- --testPathPattern=webcontainer-driver.unit --ci` exits `0`.
- [ ] CI step: `pnpm --filter @devs/sandbox tsc --noEmit` exits `0`.
- [ ] Verify that `packages/sandbox/src/index.ts` exports `WebContainerDriver` by running: `node -e "const {WebContainerDriver} = require('./packages/sandbox/dist'); if (!WebContainerDriver) process.exit(1);"` after build.
