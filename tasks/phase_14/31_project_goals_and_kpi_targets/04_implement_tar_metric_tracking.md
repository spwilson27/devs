# Task: Implement Task Autonomy Rate (TAR) Metric Tracking and Alerting (Sub-Epic: 31_Project Goals and KPI Targets)

## Covered Requirements
- [9_ROADMAP-REQ-049]

## 1. Initial Test Written
- [ ] Write a unit test in `src/metrics/__tests__/tar-tracker.test.ts` verifying that `TarTracker.recordTaskOutcome(taskId: string, outcome: 'autonomous' | 'human_intervened')` inserts a row into the `task_outcomes` SQLite table with the correct `outcome` value.
- [ ] Write a unit test verifying that `TarTracker.getTar(): number` returns `(autonomousCount / totalCount) * 100`, returning 0 when no tasks are recorded.
- [ ] Write a unit test verifying that `TarTracker.meetsKpiThreshold(): boolean` returns `true` when `getTar() > 85` and `false` when `<= 85`.
- [ ] Write a unit test verifying that `TarTracker.recordTaskOutcome()` correctly distinguishes tasks where a human provided feedback/override (outcome = `'human_intervened'`) vs. tasks that completed fully autonomously (outcome = `'autonomous'`).
- [ ] Write an integration test in `src/metrics/__tests__/tar-tracker.integration.test.ts` that simulates 100 task outcomes (86 autonomous, 14 human) and asserts `getTar() === 86` and `meetsKpiThreshold() === true`.
- [ ] Write an integration test that simulates 100 task outcomes (84 autonomous, 16 human) and asserts `meetsKpiThreshold() === false`.
- [ ] Write an E2E test in `e2e/kpi-tar.test.ts` that runs a mini pipeline with all mocked agents (no human intervention) and asserts the KPI report includes `tar_pct` and `tar_kpi_met: true`.

## 2. Task Implementation
- [ ] Create migration `migrations/0XX_create_task_outcomes.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS task_outcomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    task_id TEXT NOT NULL UNIQUE,
    outcome TEXT NOT NULL CHECK(outcome IN ('autonomous','human_intervened')),
    recorded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  ```
- [ ] Implement `src/metrics/tar-tracker.ts` exporting class `TarTracker`:
  - Constructor accepts `db: DatabaseConnection` and `projectId: string`.
  - `recordTaskOutcome(taskId: string, outcome: 'autonomous' | 'human_intervened'): void` – inserts or replaces into `task_outcomes` (a task can be updated if outcome changes).
  - `getTar(): number` – `SELECT COUNT(*) FROM task_outcomes WHERE project_id = ? AND outcome = 'autonomous'` divided by total; returns 0 if no tasks recorded.
  - `meetsKpiThreshold(): boolean` – returns `getTar() > 85`.
- [ ] Wire `TarTracker.recordTaskOutcome(taskId, 'autonomous')` in `TaskExecutionService.completeTask()` when the task passes automated review with no human input.
- [ ] Wire `TarTracker.recordTaskOutcome(taskId, 'human_intervened')` in `OrchestratorService.applyHumanDirective()` and in `ApprovalService.recordApproval()` when any non-automatic approval or override is processed for a task.
- [ ] Extend `KpiReport` interface in `src/types/kpi.ts` with:
  ```typescript
  tar_pct: number;
  tar_kpi_met: boolean;
  ```
- [ ] Populate these fields in `KpiReportService.generate()` using `TarTracker`.
- [ ] Implement `TarAlertService` in `src/metrics/tar-alert.ts`:
  - `checkAndAlert(): void` – if `getTar() < 85` after at least 20 tasks recorded, emit a `KpiAlert` event via the existing `EventBus` with `{ type: 'TAR_BELOW_THRESHOLD', current: tarValue, threshold: 85 }`.
  - Call `checkAndAlert()` every 10 tasks via `TaskExecutionService`.

## 3. Code Review
- [ ] Confirm `recordTaskOutcome()` uses `INSERT OR REPLACE` so that reclassifying a task (e.g., initially autonomous then later overridden) updates correctly.
- [ ] Verify the `checkAndAlert()` method is only triggered after at least 20 outcomes are recorded to avoid misleading early alerts (configurable via `MIN_TASKS_FOR_TAR_ALERT` constant in `src/metrics/constants.ts`).
- [ ] Confirm `TarTracker` has no dependency on UI or CLI layers (metrics layer must remain infrastructure-agnostic).
- [ ] Verify the `KpiAlert` event is consumed by the `DashboardService` to display a warning in the VSCode Webview.
- [ ] Ensure `task_id` has a UNIQUE constraint to prevent double-recording.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/metrics/__tests__/tar-tracker.test.ts` and confirm all unit tests pass.
- [ ] Run `pnpm test src/metrics/__tests__/tar-tracker.integration.test.ts` and confirm all integration tests pass.
- [ ] Run `pnpm test e2e/kpi-tar.test.ts` and confirm the E2E test passes.
- [ ] Run `pnpm test --coverage` and verify `src/metrics/tar-tracker.ts` and `src/metrics/tar-alert.ts` each report ≥ 95% line coverage.

## 5. Update Documentation
- [ ] Add a `## KPI: Task Autonomy Rate (TAR)` section to `docs/metrics.md` defining TAR, the 85% threshold, how outcomes are classified, and the alert mechanism.
- [ ] Update `memory/phase_14_decisions.md`: "`TarTracker` implemented in `src/metrics/`; wired into `TaskExecutionService` and `ApprovalService`. Alert fires below 85% TAR after 20+ tasks."

## 6. Automated Verification
- [ ] Run `pnpm run validate-all` and confirm exit code 0.
- [ ] Run `node scripts/verify-tar-kpi.mjs` which queries `task_outcomes` after a smoke run and asserts all rows have a valid `outcome` value and `tar_pct` in the KPI report is a float between 0–100.
- [ ] Confirm the CI `kpi-tar-check` step passes.
