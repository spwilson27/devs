# Task: Recursive Resource Drain Detection and Sandbox DoS Protection (Sub-Epic: 22_Agent Identity and Conflict Resolution)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-THR-003]

## 1. Initial Test Written
- [ ] Create `src/sandbox/monitor/__tests__/ResourceDrainDetector.test.ts`.
- [ ] Write a unit test `should raise RESOURCE_DRAIN_ALERT when file count in sandbox exceeds 10,000` that calls `checkFilesystemQuota({ sandboxId: 'sb-001', fileCount: 10_001, fileCountLimit: 10_000 })` and asserts it returns `{ violated: true, violation: 'FILE_COUNT_EXCEEDED', sandboxId: 'sb-001' }`.
- [ ] Write a unit test `should not raise alert when file count is within quota` that calls `checkFilesystemQuota({ sandboxId: 'sb-001', fileCount: 5_000, fileCountLimit: 10_000 })` and asserts `{ violated: false }`.
- [ ] Write a unit test `should raise RESOURCE_DRAIN_ALERT when process count exceeds 512` that calls `checkProcessQuota({ sandboxId: 'sb-001', processCount: 513, processCountLimit: 512 })` and asserts `{ violated: true, violation: 'PROCESS_COUNT_EXCEEDED' }`.
- [ ] Write a unit test `should terminate the sandbox and emit SECURITY_PAUSE event on quota violation` that stubs `SandboxProvider.terminate(sandboxId)` and `EventBus.emit`, calls `enforceQuota(violation)`, and asserts both stubs were called with the correct arguments.
- [ ] Write an integration test `should detect recursive file creation within 5 polling cycles` that simulates a sandbox where a mock filesystem returns `fileCount` growing by 2,000 each polling tick, and asserts that `ResourceDrainDetector` fires a `RESOURCE_DRAIN_ALERT` by the third tick (at 6,000 files).
- [ ] Write an integration test `should detect process fork-bomb pattern within 5 polling cycles` that simulates `processCount` doubling each tick from 64 and asserts the detector fires at the cycle where count first exceeds 512.

## 2. Task Implementation
- [ ] Create `src/sandbox/monitor/ResourceDrainDetector.ts`.
- [ ] Define `FilesystemQuotaConfig` interface: `{ sandboxId: string; fileCountLimit: number; directoryDepthLimit: number; maxFileSizeBytes: number; }`.
- [ ] Define `ProcessQuotaConfig` interface: `{ sandboxId: string; processCountLimit: number; }`.
- [ ] Define `QuotaViolation` interface: `{ violated: boolean; violation?: 'FILE_COUNT_EXCEEDED' | 'PROCESS_COUNT_EXCEEDED' | 'DIRECTORY_DEPTH_EXCEEDED' | 'FILE_SIZE_EXCEEDED'; sandboxId: string; observedValue?: number; limitValue?: number; }`.
- [ ] Implement `checkFilesystemQuota(params: { sandboxId: string; fileCount: number; fileCountLimit: number; directoryDepth?: number; depthLimit?: number }): QuotaViolation`.
- [ ] Implement `checkProcessQuota(params: { sandboxId: string; processCount: number; processCountLimit: number }): QuotaViolation`.
- [ ] Implement `enforceQuota(violation: QuotaViolation): Promise<void>` — calls `SandboxProvider.terminate(violation.sandboxId)` and emits `EventBus.emit('sandbox:security:resource_drain', { ...violation, terminatedAt: new Date().toISOString() })`.
- [ ] Implement `ResourceDrainDetector` class with a `startPolling(sandboxId: string, intervalMs: number): void` method that:
  - Polls `SandboxProvider.getMetrics(sandboxId)` every `intervalMs` milliseconds (default: 2,000ms).
  - Calls `checkFilesystemQuota` and `checkProcessQuota` on each tick.
  - On the first violation, calls `enforceQuota` and stops polling for that sandbox.
- [ ] Set default quota limits: `fileCountLimit: 10_000`, `processCountLimit: 512`, `directoryDepthLimit: 20`.
- [ ] Persist each `RESOURCE_DRAIN_ALERT` event to the `sandbox_violations` SQLite table (schema: `violation_id TEXT PRIMARY KEY`, `sandbox_id TEXT`, `violation_type TEXT`, `observed_value INTEGER`, `limit_value INTEGER`, `terminated_at TEXT`).
- [ ] Register `ResourceDrainDetector.startPolling` in `src/sandbox/SandboxProvider.ts` — call it immediately after each sandbox is provisioned.
- [ ] Add `// REQ: 5_SECURITY_DESIGN-REQ-SEC-THR-003` inline comment above the `enforceQuota` method.

## 3. Code Review
- [ ] Confirm `startPolling` stores the `setInterval` handle and exposes a `stopPolling(sandboxId: string): void` method, preventing interval leaks when a sandbox is terminated normally.
- [ ] Verify `enforceQuota` is idempotent — if called twice for the same `sandboxId` (e.g., race between two simultaneous quota violations), it must not attempt to terminate an already-terminated sandbox. Use a `Set<string>` of terminated sandbox IDs guarded by a check before calling `SandboxProvider.terminate`.
- [ ] Confirm the SQLite insert for `sandbox_violations` uses a parameterized query (no string interpolation) to prevent SQL injection from a malicious sandbox ID.
- [ ] Ensure the `EventBus.emit` call is non-blocking and wrapped in try/catch so a failed event emission does not prevent sandbox termination.
- [ ] Verify quota limits are configurable via the project config file (e.g., `devs.config.json` under `sandbox.quotas.*`) and not hard-coded — the defaults are applied only when config is absent.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=ResourceDrainDetector` and confirm all tests pass with zero failures.
- [ ] Run `npm run lint` and confirm zero errors in `src/sandbox/monitor/`.
- [ ] Run `npm run build` and confirm zero TypeScript compilation errors.

## 5. Update Documentation
- [ ] Create `docs/security/resource-drain-protection.md` documenting the `ResourceDrainDetector` behavior: polling interval, quota defaults, violation types, sandbox termination flow, and the `SECURITY_PAUSE` event chain. Include a Mermaid state diagram showing `RUNNING → QUOTA_VIOLATION_DETECTED → TERMINATED`. Reference `5_SECURITY_DESIGN-REQ-SEC-THR-003`.
- [ ] Update `docs/architecture/sandbox.md` to describe the quota enforcement lifecycle and cross-reference `5_SECURITY_DESIGN-REQ-SEC-THR-003`.
- [ ] Update `devs.config.json.schema` to document the `sandbox.quotas.fileCountLimit`, `sandbox.quotas.processCountLimit`, and `sandbox.quotas.directoryDepthLimit` configuration keys with their default values and allowed ranges.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=ResourceDrainDetector --coverage` and assert line coverage for `ResourceDrainDetector.ts` is ≥ 90%.
- [ ] Run `grep -rn "5_SECURITY_DESIGN-REQ-SEC-THR-003" src/` and confirm at least one match exists in `ResourceDrainDetector.ts`.
- [ ] After the integration tests run, query the in-memory SQLite test database: `SELECT COUNT(*) FROM sandbox_violations` must be ≥ 2 (one file-count violation and one process-count violation from the integration tests), confirming the persistence path is exercised.
