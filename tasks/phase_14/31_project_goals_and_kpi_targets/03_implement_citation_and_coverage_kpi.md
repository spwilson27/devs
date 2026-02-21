# Task: Implement Research Citation Count and Requirement Coverage KPI Tracking (Sub-Epic: 31_Project Goals and KPI Targets)

## Covered Requirements
- [9_ROADMAP-REQ-048]

## 1. Initial Test Written
- [ ] Write a unit test in `src/metrics/__tests__/citation-tracker.test.ts` verifying that `CitationTracker.recordCitation(source: CitationSource)` inserts a row into the `research_citations` SQLite table with fields `url`, `title`, `phase`, `recorded_at`, `project_id`.
- [ ] Write a unit test verifying that `CitationTracker.getCitationCount(): number` returns the count of distinct citations for the current project, and returns 0 when the table is empty.
- [ ] Write a unit test verifying that `CitationTracker.meetsKpiThreshold(): boolean` returns `true` when `getCitationCount() > 5` and `false` when `<= 5`.
- [ ] Write a unit test in `src/metrics/__tests__/requirement-coverage-tracker.test.ts` verifying that `RequirementCoverageTracker.recordMapping(reqId: string, taskId: string)` inserts into `requirement_task_mappings`.
- [ ] Write a unit test verifying that `RequirementCoverageTracker.getCoveragePercentage(): number` returns `(coveredRequirements / totalRequirements) * 100` where `coveredRequirements` = count of distinct `reqId` values in the mappings table, and `totalRequirements` = count of rows in the `requirements` table for the project.
- [ ] Write a unit test verifying that `RequirementCoverageTracker.meetsKpiThreshold(): boolean` returns `true` when `getCoveragePercentage() >= 100`.
- [ ] Write an integration test in `src/metrics/__tests__/kpi-9_ROADMAP-048.integration.test.ts` that populates the DB with 6 citations and 100% requirement mappings, then asserts `KpiReportService.generate()` includes `{ citation_count: 6, citation_kpi_met: true, requirement_coverage_pct: 100, requirement_coverage_kpi_met: true }`.
- [ ] Write an E2E test in `e2e/kpi-citation-coverage.test.ts` that runs a minimal project pipeline and verifies the output KPI report JSON contains `citation_count` and `requirement_coverage_pct` fields.

## 2. Task Implementation
- [ ] Create migration `migrations/0XX_create_research_citations.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS research_citations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    phase TEXT NOT NULL CHECK(phase IN ('discovery','architecture','build','research')),
    recorded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  ```
- [ ] Create migration `migrations/0XX_create_requirement_task_mappings.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS requirement_task_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    req_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    UNIQUE(project_id, req_id, task_id)
  );
  ```
- [ ] Implement `src/metrics/citation-tracker.ts` exporting class `CitationTracker`:
  - Constructor accepts `db: DatabaseConnection` and `projectId: string`.
  - `recordCitation(source: CitationSource): void` – inserts into `research_citations`.
  - `getCitationCount(): number` – `SELECT COUNT(*) FROM research_citations WHERE project_id = ?`.
  - `meetsKpiThreshold(): boolean` – returns `getCitationCount() > 5`.
  - `CitationSource` type: `{ url: string; title?: string; phase: string }`.
- [ ] Implement `src/metrics/requirement-coverage-tracker.ts` exporting class `RequirementCoverageTracker`:
  - Constructor accepts `db: DatabaseConnection` and `projectId: string`.
  - `recordMapping(reqId: string, taskId: string): void` – upserts into `requirement_task_mappings`.
  - `getCoveragePercentage(): number` – queries distinct covered req_ids vs. total requirements in the `requirements` table; returns 0 if no requirements exist.
  - `meetsKpiThreshold(): boolean` – returns `getCoveragePercentage() >= 100`.
- [ ] Wire `CitationTracker.recordCitation()` inside `ResearchAgent.addSource()` so every URL cited in research reports is tracked.
- [ ] Wire `RequirementCoverageTracker.recordMapping()` inside `Distiller.distillPhase()` after each task is generated, mapping each covered `reqId` from the task spec to its task ID.
- [ ] Extend `KpiReport` interface (in `src/types/kpi.ts`) with:
  ```typescript
  citation_count: number;
  citation_kpi_met: boolean;
  requirement_coverage_pct: number;
  requirement_coverage_kpi_met: boolean;
  ```
- [ ] Populate these fields in `KpiReportService.generate()` using `CitationTracker` and `RequirementCoverageTracker`.

## 3. Code Review
- [ ] Confirm `recordCitation()` uses an `INSERT OR IGNORE` or checks for duplicate URLs per project to avoid double-counting.
- [ ] Verify `getCoveragePercentage()` handles the edge case where `totalRequirements = 0` (return `100` only when all requirements are explicitly mapped; return `0` when the requirements table is empty).
- [ ] Confirm both tracker classes are exported from `src/metrics/index.ts`.
- [ ] Verify that `ResearchAgent.addSource()` is called for every external URL referenced, not just the final report links.
- [ ] Ensure both migrations are idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE UNIQUE INDEX IF NOT EXISTS`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/metrics/__tests__/citation-tracker.test.ts` and confirm all unit tests pass.
- [ ] Run `pnpm test src/metrics/__tests__/requirement-coverage-tracker.test.ts` and confirm all unit tests pass.
- [ ] Run `pnpm test src/metrics/__tests__/kpi-9_ROADMAP-048.integration.test.ts` and confirm all integration tests pass.
- [ ] Run `pnpm test e2e/kpi-citation-coverage.test.ts` and confirm the E2E test passes.
- [ ] Run `pnpm test --coverage` and verify both tracker files report ≥ 95% line and branch coverage.

## 5. Update Documentation
- [ ] Add a `## KPI: Research Citation Count & Requirement Coverage` section to `docs/metrics.md` documenting the thresholds (citation count > 5, coverage = 100%), the DB tables, and how to view the KPI report.
- [ ] Update `memory/phase_14_decisions.md`: "`CitationTracker` and `RequirementCoverageTracker` added to `src/metrics/`; wired into `ResearchAgent` and `Distiller` respectively."

## 6. Automated Verification
- [ ] Run `pnpm run validate-all` and confirm exit code 0.
- [ ] Run `node scripts/verify-kpi-citation-coverage.mjs` which connects to the test DB after a smoke run, asserts `research_citations` has > 5 rows, and asserts all requirement IDs in the `requirements` table appear in `requirement_task_mappings`.
- [ ] Confirm the CI `kpi-citation-coverage-check` step passes.
