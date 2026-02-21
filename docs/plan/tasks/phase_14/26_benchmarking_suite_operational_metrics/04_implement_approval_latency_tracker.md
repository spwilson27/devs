# Task: Implement Approval Latency Tracker Benchmark (Sub-Epic: 26_Benchmarking Suite Operational Metrics)

## Covered Requirements
- [1_PRD-REQ-MET-013]

## 1. Initial Test Written
- [ ] Create `src/benchmarks/__tests__/approval-latency-tracker.test.ts`.
- [ ] Write a unit test `recordApprovalEntry stores a timestamp in the state DB for the given taskId when state transitions to WAIT_FOR_APPROVAL`.
- [ ] Write a unit test `recordApprovalExit computes duration correctly when approvalEntry exists for taskId` by inserting a fake entry with `entryAt = Date.now() - 5000` and calling `recordApprovalExit`, asserting the returned duration is within `[4900, 5100]` ms.
- [ ] Write a unit test `recordApprovalExit returns null and logs WARN when no approvalEntry exists for taskId` confirming a graceful no-op.
- [ ] Write a unit test `getApprovalLatencyStats returns correct totalMs, averageMs, maxMs, minMs, and sampleCount from multiple recorded sessions`.
- [ ] Write a unit test `getApprovalLatencyStats returns zeroed stats when no approval sessions have been recorded`.
- [ ] Write an integration test `approvalLatencyTracker records and retrieves a full approval cycle using the real SQLite state DB in a tmp directory`.
- [ ] Use `vitest` with `vi.mock('../state/db')` for unit tests; use a real temp SQLite DB for the integration test.

## 2. Task Implementation
- [ ] Create `src/benchmarks/approval-latency-tracker.ts`.
- [ ] Define and export interfaces:
  ```ts
  export interface ApprovalSession {
    taskId: string;
    entryAt: number;   // Unix ms timestamp
    exitAt?: number;   // Unix ms timestamp; undefined if still waiting
    durationMs?: number;
  }

  export interface ApprovalLatencyStats {
    sampleCount: number;
    totalMs: number;
    averageMs: number;
    minMs: number;
    maxMs: number;
  }
  ```
- [ ] Add a `approval_latency` table to the SQLite schema migration in `src/state/migrations/`:
  ```sql
  CREATE TABLE IF NOT EXISTS approval_latency (
    task_id   TEXT PRIMARY KEY,
    entry_at  INTEGER NOT NULL,
    exit_at   INTEGER,
    duration_ms INTEGER
  );
  ```
  Create migration file `src/state/migrations/014_add_approval_latency_table.sql`.
- [ ] Implement `async function recordApprovalEntry(db: Database, taskId: string): Promise<void>`:
  - Insert a row into `approval_latency` with `task_id = taskId`, `entry_at = Date.now()`, `exit_at = NULL`, `duration_ms = NULL`.
  - Use `INSERT OR REPLACE` to handle restarts.
- [ ] Implement `async function recordApprovalExit(db: Database, taskId: string): Promise<number | null>`:
  - Query `approval_latency` for `task_id = taskId`.
  - If no row, log `WARN` and return `null`.
  - Otherwise compute `durationMs = Date.now() - row.entry_at`, update the row with `exit_at` and `duration_ms`, return `durationMs`.
- [ ] Implement `async function getApprovalLatencyStats(db: Database): Promise<ApprovalLatencyStats>`:
  - Query `SELECT COUNT(*), SUM(duration_ms), AVG(duration_ms), MIN(duration_ms), MAX(duration_ms) FROM approval_latency WHERE duration_ms IS NOT NULL`.
  - Return the populated `ApprovalLatencyStats`; return all-zero stats if `sampleCount === 0`.
- [ ] Export all three functions and both interfaces as named exports.
- [ ] Register in `src/benchmarks/index.ts`.
- [ ] Add `// [1_PRD-REQ-MET-013]` traceability comment at top of file below imports.

## 3. Code Review
- [ ] Confirm `recordApprovalEntry` uses `INSERT OR REPLACE` (not plain `INSERT`) to tolerate duplicate calls (e.g., after an agent restart).
- [ ] Confirm `recordApprovalExit` never throws; it must return `null` gracefully if no entry row exists.
- [ ] Confirm the migration file is idempotent (`CREATE TABLE IF NOT EXISTS`).
- [ ] Confirm `getApprovalLatencyStats` filters `WHERE duration_ms IS NOT NULL` to exclude in-progress sessions.
- [ ] Confirm the `[1_PRD-REQ-MET-013]` traceability comment is present.
- [ ] Confirm no direct `Date.now()` calls exist inside `getApprovalLatencyStats` (it is a pure aggregation query).

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/benchmarks/__tests__/approval-latency-tracker.test.ts` and confirm all tests pass with zero failures.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript compiler errors.

## 5. Update Documentation
- [ ] Create `src/benchmarks/approval-latency-tracker.agent.md` documenting:
  - Purpose: tracks total time the orchestrator spends in `WAIT_FOR_APPROVAL` state per task.
  - DB schema: `approval_latency` table columns and their meanings.
  - API: `recordApprovalEntry`, `recordApprovalExit`, `getApprovalLatencyStats` signatures and usage.
  - How to interpret stats: `averageMs` is the primary KPI for `[1_PRD-REQ-MET-013]`.
- [ ] Add an entry to `docs/benchmarks/README.md` under "Operational Metrics" for this tracker.
- [ ] Update `src/state/migrations/README.md` (or equivalent migration registry) to reference migration `014_add_approval_latency_table.sql`.

## 6. Automated Verification
- [ ] Run `npx vitest run src/benchmarks/__tests__/approval-latency-tracker.test.ts --reporter=verbose 2>&1 | grep -E "PASS|FAIL"` and assert contains `PASS` and not `FAIL`.
- [ ] Run `grep -c "approval_latency" src/state/migrations/014_add_approval_latency_table.sql` and assert output `>= 1`.
