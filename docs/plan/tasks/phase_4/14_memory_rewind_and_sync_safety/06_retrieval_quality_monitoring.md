# Task: Implement Vector Retrieval Quality Monitoring to Mitigate Long-Term Hallucination Risk (Sub-Epic: 14_Memory_Rewind_and_Sync_Safety)

## Covered Requirements
- [8_RISKS-REQ-137], [8_RISKS-REQ-122]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/retrieval-monitor.test.ts`, write the following tests:
  - **`measureRetrievalPrecision` returns 1.0 for perfectly relevant results**: Given a golden set of relevant `entry_id`s and a result set that is a subset of the golden set, assert precision = 1.0.
  - **`measureRetrievalPrecision` returns 0.0 for entirely irrelevant results**: Assert precision = 0.0 when no returned IDs are in the golden set.
  - **`measureRetrievalPrecision` handles partial overlap correctly**: Assert precision = 0.5 when 2 of 4 returned results are in the golden set.
  - **`recordRetrievalMetric` writes a row to SQLite**: Call `recordRetrievalMetric({ query, topK, precision, recallEstimate, storeSize })` and assert a row appears in `memory_retrieval_metrics` with the correct values.
  - **Noise rate alert**: Call `checkRetrievalNoiseAlert({ db, threshold: 0.3 })` when the rolling average precision over the last 20 queries drops below `0.7` (noise > 0.3), and assert it returns `{ alert: true, averagePrecision: <value> }`.
  - **No alert when precision is healthy**: Assert `checkRetrievalNoiseAlert` returns `{ alert: false }` when rolling average precision >= 0.7.

## 2. Task Implementation
- [ ] Create `packages/memory/src/retrieval-monitor.ts` and implement:
  ```typescript
  export function measureRetrievalPrecision(
    returnedIds: string[],
    relevantIds: string[]
  ): number;

  export async function recordRetrievalMetric(
    sqliteDb: SQLiteDB,
    params: {
      query: string;
      topK: number;
      precision: number;
      recallEstimate: number | null;
      storeSize: number;
      runAt?: string;  // ISO-8601, defaults to now
    }
  ): Promise<void>;

  export async function checkRetrievalNoiseAlert(params: {
    sqliteDb: SQLiteDB;
    threshold?: number;       // noise threshold, default 0.3
    windowSize?: number;      // rolling window, default 20
  }): Promise<{ alert: boolean; averagePrecision?: number }>;
  ```
- [ ] In `.devs/state.sqlite`, create a migration (add to `packages/core/src/migrations/`) for the `memory_retrieval_metrics` table:
  ```sql
  CREATE TABLE IF NOT EXISTS memory_retrieval_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_at TEXT NOT NULL,
    query_hash TEXT NOT NULL,   -- SHA-256 of the query string (no raw PII)
    top_k INTEGER NOT NULL,
    precision REAL NOT NULL,
    recall_estimate REAL,
    store_size INTEGER NOT NULL
  );
  ```
- [ ] In `packages/memory/src/search-memory.ts`, after every `searchMemory` call that returns results, call `recordRetrievalMetric` asynchronously (fire-and-forget with error suppression so monitoring never blocks retrieval).
- [ ] In `packages/core/src/health-check.ts`, add a `memoryRetrievalHealth` check that calls `checkRetrievalNoiseAlert`. If `alert: true`, emit a `WARN` log entry and surface a non-blocking warning in the CLI output: `⚠ Vector retrieval noise elevated (avg precision: X.XX). Consider running 'devs memory prune-stale'.`
- [ ] Add a `devs memory diagnostics` CLI subcommand in `packages/cli/src/commands/memory.ts` that queries `memory_retrieval_metrics` and prints a table of: store size over time, rolling average precision (last 20 queries), and total retrievals.

## 3. Code Review
- [ ] Confirm that `recordRetrievalMetric` stores a **hash** of the query (not raw text) to avoid leaking potentially sensitive project-specific strings into the metrics table.
- [ ] Verify that monitoring calls in `search-memory.ts` are truly fire-and-forget (use `.catch(() => {})` or equivalent) and cannot cause `searchMemory` to throw or slow down due to monitoring failures.
- [ ] Ensure the `windowSize` default of 20 is documented and configurable via `DEVS_RETRIEVAL_MONITOR_WINDOW` environment variable.
- [ ] Confirm the migration is guarded with `CREATE TABLE IF NOT EXISTS` (idempotent).
- [ ] Verify `checkRetrievalNoiseAlert` does not emit a false alert on a cold start where fewer than `windowSize` samples exist — it should return `{ alert: false }` if fewer than 5 samples are present.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test` — all retrieval monitor tests must pass.
- [ ] Run `pnpm --filter @devs/core test` — health-check integration tests must pass.
- [ ] Run `pnpm --filter @devs/cli test` — diagnostics command tests must pass.

## 5. Update Documentation
- [ ] Update `packages/memory/README.md` with a "Retrieval Quality Monitoring" section documenting `measureRetrievalPrecision`, `recordRetrievalMetric`, `checkRetrievalNoiseAlert`, and the `DEVS_RETRIEVAL_MONITOR_WINDOW` env var.
- [ ] Update `packages/core/docs/health-checks.md` to include `memoryRetrievalHealth` as a registered health check with its alert threshold and recommended action.
- [ ] Add entry to `.devs/agent-memory/architecture-decisions.md`: "Retrieval quality is monitored via rolling precision tracked in SQLite. Alert fires when average precision over the last 20 queries drops below 0.7. Monitoring is fire-and-forget and never blocks retrieval. Raw queries are hashed before storage."

## 6. Automated Verification
- [ ] Run `pnpm test:e2e --grep "retrieval quality monitoring"` and confirm exit code 0.
- [ ] Seed the `memory_retrieval_metrics` table with 20 rows of precision=0.5, then run `devs memory diagnostics` and assert the output contains `⚠` and a precision value below 0.7.
- [ ] Run `pnpm tsc --noEmit` and assert zero type errors.
