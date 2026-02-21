# Task: Implement Sandbox Resource Exhaustion Detection & Ephemeral Cleanup (Sub-Epic: 07_Resource Quotas & Constraints)

## Covered Requirements
- [8_RISKS-REQ-123], [8_RISKS-REQ-034]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/resource-exhaustion-handler.test.ts`, write unit tests for a `ResourceExhaustionHandler` class:
  - Assert that `onOomKill(containerId: string)` emits a `sandbox:oom` event with `{ containerId, timestamp }`.
  - Assert that `onOomKill` calls `DockerDriver.forceStop(containerId)` if the container is still running (mock `isRunning()` returning `true`).
  - Assert that `onOomKill` calls `cleanupEphemeralArtifacts(containerId)` which removes the container's writable layer and temp files via `docker rm -f <id>`.
  - Assert that `onDiskQuotaExceeded(containerId: string)` emits a `sandbox:disk_quota` event and also calls `cleanupEphemeralArtifacts`.
  - Assert that `cleanupEphemeralArtifacts` resolves successfully even if `docker rm -f` exits with a non-zero code (container already gone).
  - Assert that after cleanup, the handler emits a `sandbox:cleanup_complete` event with `{ containerId, cleanedAt }`.
- [ ] Write a test asserting that `SandboxManager` subscribes to OOM events from the Docker daemon by parsing `docker events --filter event=oom --format '{{.ID}}'` output; mock the stream to simulate an OOM event and confirm `onOomKill` is invoked.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/handlers/resource-exhaustion-handler.ts`:
  - Export `class ResourceExhaustionHandler extends EventEmitter`.
  - Implement `async onOomKill(containerId: string): Promise<void>`:
    1. Emit `'sandbox:oom'` with `{ containerId, timestamp: Date.now() }`.
    2. If `await this.driver.isRunning(containerId)`, call `await this.driver.forceStop(containerId)`.
    3. Call `await this.cleanupEphemeralArtifacts(containerId)`.
    4. Emit `'sandbox:cleanup_complete'` with `{ containerId, cleanedAt: Date.now() }`.
  - Implement `async onDiskQuotaExceeded(containerId: string): Promise<void>`:
    1. Emit `'sandbox:disk_quota'` with `{ containerId, timestamp: Date.now() }`.
    2. Call `await this.cleanupEphemeralArtifacts(containerId)`.
    3. Emit `'sandbox:cleanup_complete'` with `{ containerId, cleanedAt: Date.now() }`.
  - Implement `private async cleanupEphemeralArtifacts(containerId: string): Promise<void>`:
    - Run `docker rm -f <containerId>` via `execa`; swallow non-zero exit (container may already be gone).
    - Delete the host-side temp directory for the sandbox at `os.tmpdir()/devs-sandbox-<containerId>` using `fs.rm({ recursive: true, force: true })`.
- [ ] In `packages/sandbox/src/sandbox-manager.ts`, create `SandboxManager`:
  - On startup, spawn `docker events --filter event=oom --format '{{.ID}}'` as a child process.
  - For each line of output (a container ID), call `this.exhaustionHandler.onOomKill(containerId)`.
  - Ensure the `docker events` process is restarted if it exits unexpectedly (max 3 retries with exponential back-off).
- [ ] Wire `ResourceExhaustionHandler` into `DockerDriver`: call `onDiskQuotaExceeded` whenever `DiskQuotaExceededError` is thrown from `FilesystemManager`.

## 3. Code Review
- [ ] Verify `cleanupEphemeralArtifacts` is idempotent: calling it twice for the same container must not throw.
- [ ] Confirm all `EventEmitter` event names are defined as string constants (e.g., `SANDBOX_EVENTS.OOM_KILL`) to prevent typos.
- [ ] Verify the `docker events` watcher is gracefully shut down when `SandboxManager.shutdown()` is called (kill the child process and remove listeners).
- [ ] Confirm host-side temp directory cleanup uses `fs.rm` with `{ force: true }` to prevent failures on already-missing directories.
- [ ] Check that retry logic for the `docker events` watcher caps at 3 attempts and logs an error if all retries fail, without crashing the process.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="resource-exhaustion-handler"` and confirm all assertions pass.
- [ ] Confirm `SandboxManager` OOM watcher test passes with a mocked `docker events` stream outputting a fake container ID.

## 5. Update Documentation
- [ ] Add a "Resource Exhaustion & Cleanup" section to `packages/sandbox/README.md` documenting:
  - OOM kill detection via `docker events`.
  - Automatic ephemeral cleanup: container removal + host temp dir deletion.
  - Events emitted: `sandbox:oom`, `sandbox:disk_quota`, `sandbox:cleanup_complete`.
  - How to subscribe to these events for UI/monitoring purposes.
- [ ] Update `.agent/decisions.md` with: "OOM detection is done via `docker events --filter event=oom` (push-based) rather than polling `docker stats`, to minimize overhead and ensure no OOM events are missed."
- [ ] Mark `8_RISKS-REQ-123` as "Implemented" in any agent memory file tracking requirement status.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/sandbox test --coverage` and assert `resource-exhaustion-handler.ts` achieves ≥ 90% branch coverage.
- [ ] Run `pnpm --filter @devs/sandbox build` and confirm zero TypeScript errors.
- [ ] Confirm that the CI pipeline step `pnpm --filter @devs/sandbox test --ci` exits 0 with the new tests included.
