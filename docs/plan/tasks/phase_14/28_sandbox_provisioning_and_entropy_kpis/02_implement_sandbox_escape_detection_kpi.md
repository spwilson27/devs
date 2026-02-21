# Task: Implement Sandbox Escape Detection and Zero-Escape KPI (Sub-Epic: 28_Sandbox Provisioning and Entropy KPIs)

## Covered Requirements
- [1_PRD-REQ-MET-016]

## 1. Initial Test Written
- [ ] In `src/sandbox/__tests__/escape-detection.test.ts`, write unit tests for a `SandboxEscapeDetector` class:
  - `describe('SandboxEscapeDetector.monitorFilesystem()')`:
    - Test that accessing a path outside the allowed workspace root emits an `'escape_attempt'` event with `{ type: 'filesystem', path, sandboxId }`.
    - Test that accessing a path inside the allowed workspace root does NOT emit an event.
  - `describe('SandboxEscapeDetector.monitorNetwork()')`:
    - Test that a network request to a non-allowlisted host emits an `'escape_attempt'` event with `{ type: 'network', host, sandboxId }`.
    - Test that a network request to an allowlisted host does NOT emit an event.
  - `describe('SandboxEscapeKPI.record()')`:
    - Test that calling `record(event)` inserts a row into the `sandbox_escape_events` table with columns: `id`, `sandbox_id`, `escape_type`, `detail`, `timestamp`.
    - Test that `getEscapeCount(since?: Date)`: returns 0 when no escapes recorded; returns the correct count for a given time window.
  - `describe('SandboxEscapeKPI.assertZeroEscapes()')`:
    - Test that it resolves without throwing when the escape count is 0.
    - Test that it throws `SandboxEscapeViolationError` when the escape count is > 0, including the count in the error message.
- [ ] In `src/sandbox/__tests__/escape-detection.integration.test.ts`:
  - Using an in-memory SQLite DB, insert 3 escape events and assert `assertZeroEscapes()` throws `SandboxEscapeViolationError` with count 3.
  - Insert 0 events and assert `assertZeroEscapes()` resolves.

## 2. Task Implementation
- [ ] Create `src/sandbox/escape-detection.ts`:
  - Export `EscapeType = 'filesystem' | 'network'`.
  - Export interface `EscapeAttemptEvent { sandboxId: string; type: EscapeType; detail: string; timestamp: Date; }`.
  - Implement `SandboxEscapeDetector extends EventEmitter`:
    - Constructor accepts `{ workspaceRoot: string; allowedHosts: string[]; sandboxId: string }`.
    - `checkPath(accessedPath: string): void` — resolves both paths with `path.resolve`; if `accessedPath` does not start with `workspaceRoot`, emits `'escape_attempt'` event.
    - `checkHost(host: string): void` — if `host` is not in `allowedHosts`, emits `'escape_attempt'` event.
  - Export `SandboxEscapeViolationError extends Error`.
- [ ] Create `src/sandbox/escape-kpi.ts`:
  - Accept a `better-sqlite3` `Database` instance via constructor injection.
  - On construction, run `CREATE TABLE IF NOT EXISTS sandbox_escape_events (id TEXT PRIMARY KEY, sandbox_id TEXT NOT NULL, escape_type TEXT NOT NULL, detail TEXT NOT NULL, timestamp TEXT NOT NULL)`.
  - Implement `record(event: EscapeAttemptEvent): void` — inserts a row using `crypto.randomUUID()`.
  - Implement `getEscapeCount(since?: Date): number` — counts rows with optional `WHERE timestamp >= ?` filter.
  - Implement `assertZeroEscapes(since?: Date): void` — calls `getEscapeCount`; throws `SandboxEscapeViolationError` if count > 0.
- [ ] Integrate `SandboxEscapeDetector` into the sandbox lifecycle manager (e.g., `src/sandbox/lifecycle.ts`):
  - Instantiate the detector on sandbox creation.
  - Wire the `'escape_attempt'` event to `SandboxEscapeKPI.record()` and emit a structured log entry at `ERROR` level.
  - Call `assertZeroEscapes()` as part of the post-task validation step before marking a task as complete.

## 3. Code Review
- [ ] Verify that `checkPath` uses `path.resolve` on both sides to prevent path traversal bypasses using `../` sequences.
- [ ] Confirm `allowedHosts` comparison is case-insensitive (`.toLowerCase()`).
- [ ] Verify `SandboxEscapeViolationError` includes the escape count and the offending detail(s) in `message`.
- [ ] Confirm `assertZeroEscapes()` is called from the task completion gate — an escape must block task success.
- [ ] Verify the requirement comment `// [1_PRD-REQ-MET-016]` appears above the `assertZeroEscapes()` method.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/sandbox/__tests__/escape-detection.test.ts` and confirm all unit tests pass with 0 failures.
- [ ] Run `pnpm test src/sandbox/__tests__/escape-detection.integration.test.ts` and confirm integration tests pass.
- [ ] Run `pnpm tsc --noEmit` to confirm TypeScript compiles with zero errors.

## 5. Update Documentation
- [ ] Create `src/sandbox/escape-detection.agent.md` documenting: detection mechanism, filesystem vs. network escape types, `allowedHosts` configuration, and the KPI table schema.
- [ ] Update `docs/architecture/kpis.md` with a new section "Zero Sandbox Escapes KPI" referencing the `sandbox_escape_events` table and the `assertZeroEscapes()` enforcement gate.
- [ ] Update `docs/security/sandbox-policy.md` (create if absent) to describe the escape detection system and the zero-tolerance policy.

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/sandbox` and confirm coverage ≥ 90% for `escape-detection.ts` and `escape-kpi.ts`.
- [ ] Run `pnpm run validate-all` and confirm exit code 0.
- [ ] As a negative test: temporarily insert a synthetic escape event into the in-memory DB and confirm the CI gate script (`scripts/assert-zero-escapes.ts`) exits with code 1, then revert.
