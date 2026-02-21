# Task: Implement Time-to-Market (TTM) and Time-to-First-Commit (TTFC) Metric Tracking (Sub-Epic: 31_Project Goals and KPI Targets)

## Covered Requirements
- [1_PRD-REQ-GOAL-001], [9_ROADMAP-REQ-049]

## 1. Initial Test Written
- [ ] Write a unit test in `src/metrics/__tests__/ttm-tracker.test.ts` verifying that `TtmTracker.recordPhaseStart(phase: 'discovery' | 'architecture' | 'build')` stores an ISO timestamp in the SQLite `kpi_events` table with `event_type = 'phase_start'` and the correct `phase` label.
- [ ] Write a unit test verifying that `TtmTracker.recordPhaseEnd(phase)` stores an ISO timestamp with `event_type = 'phase_end'` and that `TtmTracker.getPhaseDuration(phase)` returns the correct elapsed milliseconds.
- [ ] Write a unit test verifying that `TtmTracker.getTotalTtm()` returns the sum of durations across all three phases (discovery + architecture + build) in milliseconds.
- [ ] Write a unit test verifying that `TtmTracker.recordFirstCommit()` persists a `first_commit_at` timestamp and that `TtmTracker.getTtfc()` returns elapsed milliseconds from project init to first commit.
- [ ] Write an integration test in `src/metrics/__tests__/ttm-tracker.integration.test.ts` that runs the full orchestration pipeline stub (mock agents) and asserts the `kpi_events` table is populated with realistic phase transitions and that TTFC is under 3,600,000 ms (1 hr) for a minimal project.
- [ ] Write an E2E smoke test in `e2e/kpi-ttm.test.ts` using the CLI (`devs init --project-name smoke`) asserting that after a successful run the KPI report JSON contains `ttfc_ms`, `ttm_ms`, and that both are positive integers.

## 2. Task Implementation
- [ ] Create the SQLite migration `migrations/0XX_create_kpi_events.sql` with schema:
  ```sql
  CREATE TABLE IF NOT EXISTS kpi_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK(event_type IN ('phase_start','phase_end','first_commit')),
    phase TEXT CHECK(phase IN ('discovery','architecture','build')),
    recorded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  ```
- [ ] Implement `src/metrics/ttm-tracker.ts` exporting class `TtmTracker`:
  - Constructor accepts a `db: DatabaseConnection` (injected dependency) and a `projectId: string`.
  - `recordPhaseStart(phase)` – inserts a row into `kpi_events`.
  - `recordPhaseEnd(phase)` – inserts a row into `kpi_events`.
  - `getPhaseDuration(phase): number` – queries the table for the start/end pair and returns `end - start` in ms; throws `PhaseNotCompletedError` if either event is missing.
  - `getTotalTtm(): number` – sums durations for all three phases.
  - `recordFirstCommit()` – inserts a `first_commit` event row.
  - `getTtfc(): number` – computes elapsed ms from the row with `event_type = 'phase_start'` and `phase = 'discovery'` to the `first_commit` row; throws `FirstCommitNotRecordedError` if missing.
- [ ] Wire `TtmTracker.recordPhaseStart('discovery')` into the start of `OrchestratorService.runDiscovery()` and `recordPhaseEnd('discovery')` at completion; repeat for `architecture` and `build` phases.
- [ ] Wire `TtmTracker.recordFirstCommit()` inside the `VcsService.commitInitialCode()` call path (after the first `git commit` succeeds in the generated project workspace).
- [ ] Add `ttm` and `ttfc` fields to the `KpiReport` interface in `src/types/kpi.ts` and populate them from `TtmTracker` in `KpiReportService.generate()`.

## 3. Code Review
- [ ] Confirm `TtmTracker` has zero side-effects on construction (no DB calls until a method is invoked).
- [ ] Verify all DB queries use parameterized statements (no string interpolation) to prevent SQL injection.
- [ ] Confirm all public methods are covered by JSDoc with `@param`, `@returns`, and `@throws` tags.
- [ ] Ensure `TtmTracker` does not import from the orchestrator layer (unidirectional dependency: metrics ← orchestrator, not metrics → orchestrator).
- [ ] Verify that `kpi_events` rows are scoped by `project_id` so concurrent projects do not contaminate each other's metrics.
- [ ] Confirm error classes (`PhaseNotCompletedError`, `FirstCommitNotRecordedError`) extend a common `KpiError` base and are exported from `src/metrics/index.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/metrics/__tests__/ttm-tracker.test.ts` and confirm all unit tests pass.
- [ ] Run `pnpm test src/metrics/__tests__/ttm-tracker.integration.test.ts` and confirm all integration tests pass.
- [ ] Run `pnpm test e2e/kpi-ttm.test.ts` and confirm the E2E smoke test passes.
- [ ] Run `pnpm test --coverage` and verify `src/metrics/ttm-tracker.ts` reports ≥ 95% line and branch coverage.

## 5. Update Documentation
- [ ] Add a `## KPI: Time-to-Market (TTM) & TTFC` section to `docs/metrics.md` describing the tracked phases, the `kpi_events` schema, and how to query the KPI report.
- [ ] Update `docs/architecture/adr/ADR-XXX-kpi-tracking.md` recording the decision to use SQLite `kpi_events` table for metric persistence.
- [ ] Update the agent memory file `memory/phase_14_decisions.md` with: "TTM and TTFC tracking implemented via `TtmTracker`; injected into `OrchestratorService` and `VcsService`."

## 6. Automated Verification
- [ ] Run `pnpm run validate-all` and confirm exit code 0.
- [ ] Execute `node scripts/verify-kpi-schema.mjs` which queries the `kpi_events` table after a smoke run and asserts all required columns exist and at least one row per phase is present.
- [ ] Confirm CI pipeline step `kpi-schema-check` passes in the GitHub Actions log.
