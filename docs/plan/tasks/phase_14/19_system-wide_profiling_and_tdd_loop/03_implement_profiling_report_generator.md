# Task: Implement Profiling Report Generation and Bottleneck Analysis (Sub-Epic: 19_System-Wide Profiling and TDD Loop)

## Covered Requirements
- [1_PRD-REQ-NEED-DEVS-03]

## 1. Initial Test Written
- [ ] Create `src/profiling/__tests__/ProfilingReportGenerator.test.ts`.
- [ ] Write a unit test `should generate a Markdown report with a summary table` — provide a mock array of `PhaseMetric` entries and assert the returned string contains a Markdown table header `| Phase | Duration (ms) | Prompt Tokens | Completion Tokens | Total Tokens |`.
- [ ] Write a unit test `should highlight the slowest phase with a warning indicator` — mock metrics where `research` has the highest `durationMs`; assert the report string contains `⚠️ research` or equivalent marker.
- [ ] Write a unit test `should highlight the most token-intensive phase` — mock metrics where `code_review` has the highest `tokenUsage.total`; assert the report string contains `🔥 code_review` or equivalent marker.
- [ ] Write a unit test `should calculate and display the total duration across all phases` — assert the report footer contains a `Total` row with the sum of all `durationMs` values.
- [ ] Write a unit test `should calculate and display the total token usage across all phases` — assert the report footer `Total` row also sums `totalTokens`.
- [ ] Write an integration test `should write the report to disk at the configured output path` — use a temp directory, call `ProfilingReportGenerator.writeReport(metrics, tmpPath)`, and assert the file exists with valid Markdown content.

## 2. Task Implementation
- [ ] Create `src/profiling/ProfilingReportGenerator.ts`.
- [ ] Implement `generateMarkdownReport(metrics: PhaseMetric[]): string`:
  1. Sort metrics by `durationMs` descending.
  2. Identify `slowestPhase` (highest `durationMs`) and `mostTokenIntensivePhase` (highest `tokenUsage.total`).
  3. Build a GFM Markdown table with one row per phase. Prefix the slowest phase name with `⚠️` and the most token-intensive with `🔥` (a phase can have both).
  4. Append a `Total` footer row summing duration and tokens.
  5. Append a `## Summary` section as prose: `The slowest phase was X taking Y ms. The most token-intensive phase was Z consuming N tokens.`
  6. Return the full string.
- [ ] Implement `async writeReport(metrics: PhaseMetric[], outputPath: string): Promise<void>`:
  1. Call `generateMarkdownReport(metrics)`.
  2. Use `fs/promises.writeFile` to write to `outputPath`, creating parent directories if necessary (`fs/promises.mkdir` with `{ recursive: true }`).
- [ ] Export both functions from `src/profiling/index.ts`.
- [ ] Hook `writeReport` into the orchestrator's post-run lifecycle: after all phases complete, call `profilingService.getMetrics()` and write the report to `.devs/reports/profiling-<timestamp>.md`.

## 3. Code Review
- [ ] Verify the Markdown table is valid GFM — alignment rows (`| --- | --- |`) must be present.
- [ ] Confirm `writeReport` does not swallow errors — if `fs.writeFile` fails, the error must propagate to the caller.
- [ ] Confirm `generateMarkdownReport` is a pure function (no side effects, no I/O) — it must be independently unit-testable.
- [ ] Verify the `⚠️` and `🔥` markers do not break Markdown table rendering (test in a renderer if possible).
- [ ] Confirm the `outputPath` is sanitised and constrained to the `.devs/` directory to prevent path traversal.

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/profiling/__tests__/ProfilingReportGenerator.test.ts --reporter=verbose`.
- [ ] Assert exit code is `0` and all tests pass.
- [ ] Run the full test suite `npx vitest run` to confirm no regressions.

## 5. Update Documentation
- [ ] Add a sub-section `### Profiling Report` to `docs/architecture/profiling.md` describing the report format, where reports are stored (`.devs/reports/`), and the naming convention.
- [ ] Update `docs/agent-memory/phase_14.md` with: `ProfilingReportGenerator implemented; writes GFM Markdown bottleneck analysis to .devs/reports/profiling-<timestamp>.md after each orchestrator run.`

## 6. Automated Verification
- [ ] Run `npx vitest run --coverage src/profiling` and assert line coverage ≥ 90% for `ProfilingReportGenerator.ts`.
- [ ] Run `npx tsc --noEmit` and assert exit code is `0`.
- [ ] Manually invoke the orchestrator in `--dry-run` mode and assert a file matching `.devs/reports/profiling-*.md` exists after execution: `ls .devs/reports/profiling-*.md | wc -l | grep -q "^[1-9]" && echo PASS || echo FAIL`.
