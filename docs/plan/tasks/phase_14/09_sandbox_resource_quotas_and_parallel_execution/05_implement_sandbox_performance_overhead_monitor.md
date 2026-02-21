# Task: Implement Sandbox Performance Overhead Monitor (Sub-Epic: 09_Sandbox Resource Quotas and Parallel Execution)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-RSK-901]

## 1. Initial Test Written
- [ ] Create `src/sandbox/__tests__/SandboxPerfMonitor.test.ts`.
- [ ] Write test `records_sandbox_start_time` that:
  - Calls `SandboxPerfMonitor.start('sb-001')`.
  - Asserts an internal entry is created with `sandboxId: 'sb-001'` and a `startTime` close to `Date.now()` (within 50ms).
- [ ] Write test `records_overhead_on_stop` that:
  - Calls `SandboxPerfMonitor.start('sb-001')`, waits 20ms, then calls `SandboxPerfMonitor.stop('sb-001', { outcome: 'success' })`.
  - Asserts the returned `SandboxPerfRecord` has `durationMs >= 20` and `outcome: 'success'`.
- [ ] Write test `emits_alert_when_overhead_exceeds_threshold` that:
  - Constructs `SandboxPerfMonitor` with `alertThresholdMs: 100`.
  - Calls `start('sb-002')`, advances fake timers by 101ms, calls `stop('sb-002', { outcome: 'success' })`.
  - Asserts the `'overhead-alert'` event is emitted with `{ sandboxId: 'sb-002', durationMs: >=101 }`.
- [ ] Write test `getReport_returns_aggregate_stats` that:
  - Calls `start` + `stop` for three sandboxes with durations 50ms, 100ms, 150ms.
  - Calls `SandboxPerfMonitor.getReport()`.
  - Asserts the report contains `{ count: 3, meanMs: 100, maxMs: 150, p95Ms: 150, alertCount: 0 }`.
- [ ] Write test `persists_records_to_sqlite` that mocks `StateDatabase.insert` and asserts it is called with a `sandbox_perf_records` table entry on each `stop()`.
- [ ] Confirm all tests fail (RED).

## 2. Task Implementation
- [ ] Create `src/sandbox/SandboxPerfMonitor.ts`.
- [ ] Define `SandboxPerfRecord`:
  ```typescript
  interface SandboxPerfRecord {
    sandboxId: string;
    startTime: number;
    durationMs: number;
    outcome: 'success' | 'timeout' | 'error';
    alertFired: boolean;
  }
  ```
- [ ] Define `PerfMonitorOptions = { alertThresholdMs?: number }` with default `alertThresholdMs: 5000` (5 seconds; excessive overhead for any single sandbox warrants an alert).
- [ ] Export `class SandboxPerfMonitor extends EventEmitter`:
  - `private activeRecords = new Map<string, number>()` (sandboxId → startTime).
  - `private completedRecords: SandboxPerfRecord[] = []`.
  - `start(sandboxId: string): void`: store `Date.now()` in `activeRecords`.
  - `stop(sandboxId: string, meta: { outcome: SandboxPerfRecord['outcome'] }): SandboxPerfRecord`:
    - Compute `durationMs = Date.now() - startTime`.
    - Determine `alertFired = durationMs > this.alertThresholdMs`.
    - If `alertFired`, emit `'overhead-alert'` with `{ sandboxId, durationMs }`.
    - Push record to `completedRecords`.
    - Call `StateDatabase.insert('sandbox_perf_records', record)` (fire-and-forget; catch errors silently).
    - Return the record.
  - `getReport(): PerfReport`:
    - Compute `count`, `meanMs`, `maxMs`, `p95Ms` (sort durations, take 95th percentile index), `alertCount`.
    - Return as `PerfReport`.
- [ ] Add requirement tag: `// [5_SECURITY_DESIGN-REQ-SEC-RSK-901]`.
- [ ] Export a singleton `sandboxPerfMonitor = new SandboxPerfMonitor()`.

## 3. Code Review
- [ ] Confirm `p95Ms` is computed correctly: sort ascending, index = `Math.ceil(0.95 * count) - 1`.
- [ ] Verify `StateDatabase.insert` failures are caught and logged (not rethrown) so monitoring never crashes the sandbox runner.
- [ ] Confirm the `EventEmitter` pattern is used (not callbacks) for `'overhead-alert'` to allow multiple consumers.
- [ ] Verify `activeRecords` is cleaned up in `stop()` to prevent memory leaks in long-running processes.
- [ ] Ensure `getReport()` returns a defensive copy of the data (not mutable references).

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/sandbox/__tests__/SandboxPerfMonitor.test.ts --coverage` and confirm all tests GREEN, 100% statement coverage.
- [ ] Run the full test suite `npx jest --passWithNoTests` to confirm no regressions.

## 5. Update Documentation
- [ ] Update `src/sandbox/sandbox.agent.md` with a section "## Performance Overhead Monitor" describing: the `alertThresholdMs` default, the `'overhead-alert'` event, the `PerfReport` shape, and the SQLite persistence table `sandbox_perf_records`.
- [ ] Document the `sandbox_perf_records` table schema in `docs/database-schema.md` (columns: `sandbox_id TEXT, start_time INTEGER, duration_ms INTEGER, outcome TEXT, alert_fired INTEGER, created_at TEXT`).
- [ ] Add `SandboxPerfMonitor`, `sandboxPerfMonitor`, `SandboxPerfRecord` to `src/sandbox/index.ts` exports.

## 6. Automated Verification
- [ ] Run `npx jest src/sandbox/__tests__/SandboxPerfMonitor.test.ts --json --outputFile=test-results/perf-monitor.json` and verify `numFailedTests: 0`.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.
