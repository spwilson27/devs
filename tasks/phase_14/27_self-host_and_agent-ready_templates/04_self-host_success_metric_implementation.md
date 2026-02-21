# Task: Implement and Report the Self-Host Success Metric (Sub-Epic: 27_Self-Host and Agent-Ready Templates)

## Covered Requirements
- [9_ROADMAP-REQ-039]

## 1. Initial Test Written
- [ ] Create `src/metrics/__tests__/selfHostSuccessMetric.test.ts`:
  - Write a test `"SelfHostMetricCollector records a successful self-host run"` that:
    - Instantiates `SelfHostMetricCollector`.
    - Calls `collector.record({ taskId: "self-host-get-version-001", outcome: "success", p6StepsCompleted: 6, testsPassed: true, durationMs: 42000 })`.
    - Calls `collector.getSummary()` and asserts:
      - `summary.successCount === 1`
      - `summary.failureCount === 0`
      - `summary.successRate === 1.0`
      - `summary.lastOutcome === "success"`
  - Write a test `"SelfHostMetricCollector records a failed self-host run"` that:
    - Records an outcome with `outcome: "failure"` and `failureReason: "lint_failure"`.
    - Asserts `summary.successRate === 0.0` and `summary.lastFailureReason === "lint_failure"`.
  - Write a test `"SelfHostMetricCollector persists metrics to SQLite state"` that:
    - Mocks the SQLite state DB.
    - Calls `record()` and asserts `db.run` was called with a SQL `INSERT` into a `self_host_runs` table.
  - Write a test `"SelfHostMetricReporter generates a Markdown report"` that:
    - Instantiates `SelfHostMetricReporter` with a mock `SelfHostMetricCollector` returning two records (one success, one failure).
    - Calls `reporter.generateMarkdown()` and asserts the returned string contains:
      - `"## Self-Host Success Metric [9_ROADMAP-REQ-039]"`
      - `"Success Rate: 50%"`
      - `"self-host-get-version-001"`

## 2. Task Implementation
- [ ] Create `src/metrics/SelfHostMetricCollector.ts`:
  - Export a `SelfHostMetricCollector` class with:
    - `record(run: SelfHostRunRecord): Promise<void>` — validates fields, inserts into `self_host_runs` SQLite table, and updates in-memory summary.
    - `getSummary(): SelfHostMetricSummary` — returns aggregate statistics.
    - `getRuns(): SelfHostRunRecord[]` — returns all recorded runs.
  - Define `SelfHostRunRecord` interface: `{ taskId: string, outcome: "success" | "failure", p6StepsCompleted: number, testsPassed: boolean, durationMs: number, failureReason?: string, timestamp?: string }`.
  - Define `SelfHostMetricSummary` interface: `{ successCount: number, failureCount: number, successRate: number, lastOutcome: string, lastFailureReason?: string }`.
- [ ] Create the `self_host_runs` table migration in `src/db/migrations/0xx_self_host_runs.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS self_host_runs (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    outcome TEXT NOT NULL CHECK(outcome IN ('success','failure')),
    p6_steps_completed INTEGER NOT NULL,
    tests_passed INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    failure_reason TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  ```
- [ ] Create `src/metrics/SelfHostMetricReporter.ts`:
  - Export a `SelfHostMetricReporter` class with `generateMarkdown(): string` that renders a GFM table of all runs and a summary block.
  - The summary block must include: `## Self-Host Success Metric [9_ROADMAP-REQ-039]`, success rate, total runs, last outcome.
- [ ] Wire `SelfHostMetricCollector` into the existing metrics registry (`src/metrics/registry.ts`) under the key `"self_host_success"`.
- [ ] After a successful `P6OrchestratorLoop.execute()` run (from task 03), call `collector.record(...)` with the real outcomes.

## 3. Code Review
- [ ] Confirm `SelfHostMetricCollector` is injectable and registered in the DI container.
- [ ] Confirm the `self_host_runs` migration is guarded with `CREATE TABLE IF NOT EXISTS`.
- [ ] Confirm `successRate` is computed as `successCount / (successCount + failureCount)`, returning `0` when both are zero (no division by zero).
- [ ] Confirm `generateMarkdown()` output is valid GFM (no raw HTML).
- [ ] Confirm `SelfHostRunRecord.taskId` is validated as a non-empty string before insert.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- --testPathPattern=selfHostSuccessMetric` and confirm all four tests pass with zero failures.
- [ ] Run `npm run test -- --coverage --testPathPattern=selfHostSuccessMetric` and confirm ≥ 90% statement coverage for `SelfHostMetricCollector.ts` and `SelfHostMetricReporter.ts`.
- [ ] Run `npm run lint` on `src/metrics/` and confirm zero errors.

## 5. Update Documentation
- [ ] Add a `## Self-Host Success Metric` section to `docs/metrics.md`:
  - Define `[9_ROADMAP-REQ-039]` as: "devs must successfully implement a minor feature in its own core orchestrator using the autonomous P6 loop."
  - Document the `SelfHostMetricCollector` API, the `self_host_runs` schema, and how to query the metric.
  - Include a sample `generateMarkdown()` output.
- [ ] Update `docs/agent_memory/phase_14.md`: "SelfHostMetricCollector and SelfHostMetricReporter implemented; 9_ROADMAP-REQ-039 metric wired into metrics registry."

## 6. Automated Verification
- [ ] Run `npm run test -- --ci --testPathPattern=selfHostSuccessMetric` and verify exit code 0.
- [ ] Run the migration script against a temporary SQLite DB and assert the `self_host_runs` table is created: `node -e "const db = require('./dist/db').getDb(':memory:'); db.exec(require('fs').readFileSync('./src/db/migrations/0xx_self_host_runs.sql','utf8')); const rows = db.prepare('SELECT * FROM self_host_runs').all(); console.log('Table OK, rows:', rows.length);"` and confirm exit code 0.
