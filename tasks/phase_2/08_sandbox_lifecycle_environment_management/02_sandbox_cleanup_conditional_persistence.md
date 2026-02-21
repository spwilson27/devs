# Task: Implement Sandbox Cleanup & Conditional Persistence on Failure (Sub-Epic: 08_Sandbox Lifecycle & Environment Management)

## Covered Requirements
- [1_PRD-REQ-IMP-007], [8_RISKS-REQ-078]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/cleanup.test.ts`, write unit tests for a `SandboxCleanupService` class:
  - Test `teardown(sandboxId, { outcome: 'success' })`: verify that `SandboxProvider.destroy(sandboxId)` is called, volumes are removed, and the sandbox state is removed from any registry.
  - Test `teardown(sandboxId, { outcome: 'failure' })`: verify that `SandboxProvider.destroy` is NOT called, the container is stopped but preserved, and a structured log entry is emitted containing the `sandboxId` and `'preserved_for_debugging'`.
  - Test `deepPurge(sandboxId)`: verify it calls `docker-compose down -v` (mock the shell executor) for the given sandbox and then removes ephemeral volumes via the `VolumeManager`.
  - Test idempotency: calling `teardown` twice on a `'success'` outcome does not throw; subsequent calls are no-ops.
  - Write an integration test using a real Docker sandbox: run a no-op task, trigger success teardown, and assert the container no longer exists (`docker ps -a` output does not contain the `sandboxId`).
  - Write an integration test for failure teardown: trigger failure teardown and assert the container still exists in a stopped state.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/cleanup/SandboxCleanupService.ts`:
  - Define `TeardownOutcome = 'success' | 'failure'`.
  - Implement `teardown(sandboxId: string, opts: { outcome: TeardownOutcome }): Promise<void>`:
    - If `outcome === 'success'`: call `this.sandboxProvider.destroy(sandboxId)` which removes the container and its anonymous volumes; update internal registry to mark sandbox as `DESTROYED`.
    - If `outcome === 'failure'`: call `this.sandboxProvider.stop(sandboxId)` to halt the container without removing it; emit a structured warning log `{ event: 'sandbox_preserved', sandboxId, reason: 'task_failure' }`; update registry to `PRESERVED`.
  - Implement `deepPurge(sandboxId: string): Promise<void>`:
    - Execute the shell command `docker-compose down -v` scoped to the sandbox's compose project name using a `ShellExecutor` dependency.
    - Call `VolumeManager.removeEphemeralVolumes(sandboxId)` to clean up any named ephemeral volumes registered for this sandbox.
    - Emit a structured log `{ event: 'deep_purge_complete', sandboxId }`.
- [ ] Create `packages/sandbox/src/cleanup/VolumeManager.ts`:
  - Tracks named ephemeral volumes per `sandboxId`.
  - Implements `registerVolume(sandboxId, volumeName)` and `removeEphemeralVolumes(sandboxId)`.
- [ ] Wire `SandboxCleanupService` into the `SandboxOrchestrator` so it is called automatically at the end of each task execution with the appropriate outcome.
- [ ] Export `SandboxCleanupService`, `VolumeManager`, and `TeardownOutcome` from `packages/sandbox/src/index.ts`.

## 3. Code Review
- [ ] Verify that success-path teardown always removes volumes (no dangling anonymous volumes confirmed via `docker volume ls` in integration test).
- [ ] Verify that failure-path teardown emits a structured log that can be parsed by the monitoring subsystem (validate JSON shape matches the `SandboxEvent` schema).
- [ ] Confirm `ShellExecutor` is injected as a dependency so it can be mocked in unit tests (not spawned directly in the class body).
- [ ] Verify `deepPurge` is not called as part of normal success teardown; it is a separate, explicitly-invoked operation.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test` and confirm all unit tests in `cleanup.test.ts` pass.
- [ ] Run `pnpm --filter @devs/sandbox test:integration` and confirm both Docker-based integration tests (success and failure teardown) pass.
- [ ] Confirm test coverage for `SandboxCleanupService.ts` and `VolumeManager.ts` is ≥ 90%.

## 5. Update Documentation
- [ ] Create `packages/sandbox/src/cleanup/cleanup.agent.md` documenting: the teardown state machine (`RUNNING → DESTROYED | PRESERVED`), the conditions that trigger each path, the `deepPurge` API, and how preserved sandboxes can be inspected for debugging.
- [ ] Update `packages/sandbox/README.md` to add a "Sandbox Cleanup" section describing the success vs. failure teardown behaviors.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm exit code 0.
- [ ] In CI, run `SANDBOX_DRIVER=docker pnpm --filter @devs/sandbox test:integration` and confirm exit code 0.
- [ ] After the success integration test, run `docker ps -a --filter name=<sandboxId> --format '{{.Names}}'` and assert empty output confirming the container was destroyed.
