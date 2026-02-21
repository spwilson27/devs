# Task: Core KPI Metric Collectors (TAR, TTFC, RTI, USD/Task) (Sub-Epic: 23_Benchmarking Suite Core Metrics)

## Covered Requirements
- [9_ROADMAP-TAS-803]

## 1. Initial Test Written
- [ ] Create `src/benchmarking/__tests__/metrics/TARCollector.test.ts`.
  - Write a test asserting `TARCollector.collect(taskRunLog)` returns `{ tar: number }` where `tar` is the ratio of autonomously-completed tasks (no human intervention) to total tasks, expressed as a percentage (0–100).
  - Write a test with a `taskRunLog` of 10 tasks where 8 are autonomous → asserts `tar === 80`.
  - Write a test with zero tasks → asserts `tar === 0` (no division-by-zero error).
- [ ] Create `src/benchmarking/__tests__/metrics/TTFCCollector.test.ts`.
  - Write a test asserting `TTFCCollector.collect(taskRunLog)` returns `{ ttfcMs: number }` representing milliseconds from `devs run` invocation to the first `git commit` recorded in the log.
  - Write a test with a known start timestamp and first commit timestamp → asserts the correct delta in ms.
- [ ] Create `src/benchmarking/__tests__/metrics/RTICollector.test.ts`.
  - Write a test asserting `RTICollector.collect(taskRunLog)` returns `{ rtiMs: number }` representing average time from task assignment to first code implementation attempt.
  - Write a test with 3 tasks and known timestamps → asserts correct average.
- [ ] Create `src/benchmarking/__tests__/metrics/USDPerTaskCollector.test.ts`.
  - Write a test asserting `USDPerTaskCollector.collect(taskRunLog)` returns `{ usdPerTask: number }` calculated as `totalTokenCost / completedTaskCount`.
  - Write a test asserting `totalTokenCost` is computed as `(promptTokens * inputPricePerMToken + completionTokens * outputPricePerMToken) / 1_000_000`.
  - Write a test with zero completed tasks → asserts `usdPerTask === 0`.

## 2. Task Implementation
- [ ] Create `src/benchmarking/metrics/types.ts` and define:
  - `TaskRunEntry`: `{ taskId: string; startedAt: number; firstCommitAt?: number; firstImplementationAt?: number; completedAt?: number; humanInterventionCount: number; promptTokens: number; completionTokens: number; status: 'autonomous' | 'assisted' | 'failed' }`.
  - `TaskRunLog`: `{ runStartedAt: number; tasks: TaskRunEntry[]; modelPricing: { inputPricePerMToken: number; outputPricePerMToken: number } }`.
- [ ] Create `src/benchmarking/metrics/TARCollector.ts`:
  - `collect(log: TaskRunLog): { tar: number }` — filters tasks with `status === 'autonomous'`, computes percentage.
- [ ] Create `src/benchmarking/metrics/TTFCCollector.ts`:
  - `collect(log: TaskRunLog): { ttfcMs: number }` — finds the minimum `firstCommitAt` across all tasks; returns `firstCommitAt - log.runStartedAt`. Returns `0` if no commits found.
- [ ] Create `src/benchmarking/metrics/RTICollector.ts`:
  - `collect(log: TaskRunLog): { rtiMs: number }` — for each task with `firstImplementationAt`, computes `firstImplementationAt - startedAt`; returns arithmetic mean. Returns `0` if no data.
- [ ] Create `src/benchmarking/metrics/USDPerTaskCollector.ts`:
  - `collect(log: TaskRunLog): { usdPerTask: number }` — sums `promptTokens` and `completionTokens` across all tasks; applies `modelPricing`; divides by `completedTaskCount` (tasks with `status !== 'failed'`).
- [ ] Create `src/benchmarking/metrics/index.ts` re-exporting all collectors and types.
- [ ] Create `src/benchmarking/suites/CoreKPISuite.ts` implementing `IBenchmarkSuite`:
  - `name = 'CoreKPISuite'`
  - `requirmentIds = ['9_ROADMAP-TAS-803']`
  - `execute()`: loads `TaskRunLog` from the path specified by `DEVS_BENCHMARK_LOG_PATH` env var (or a config path); calls all four collectors; returns a `SuiteResult` with all metrics merged into `metrics` map; status is `'pass'` if TAR ≥ 85 and TTFC ≤ 3_600_000 (1 hr in ms), else `'fail'`.
- [ ] Register `CoreKPISuite` in `src/benchmarking/index.ts` via `BenchmarkRegistry.register(new CoreKPISuite())`.

## 3. Code Review
- [ ] Verify all arithmetic is done in integer milliseconds; floating-point percentages are rounded to 2 decimal places.
- [ ] Verify `USDPerTaskCollector` guards against zero completed tasks without throwing.
- [ ] Verify `CoreKPISuite.execute()` includes descriptive `details` in its `SuiteResult` (e.g., `"TAR: 87.5%, TTFC: 42min, RTI: 8.3min, USD/Task: $0.023"`).
- [ ] Verify the `TaskRunLog` schema is clearly documented in `metrics/types.ts` with JSDoc comments.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/metrics"` and confirm all four collector test files pass with zero failures.
- [ ] Run `npm run build` and confirm TypeScript compilation succeeds with zero errors.

## 5. Update Documentation
- [ ] Create `src/benchmarking/metrics/metrics.agent.md` documenting: the `TaskRunLog` schema, each collector's calculation formula, the thresholds used in `CoreKPISuite`, and how to supply the log file path via env var.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/metrics" --coverage` and confirm line coverage ≥ 90% for all files in `src/benchmarking/metrics/`.
- [ ] Run `npx tsc --noEmit` and confirm zero errors.
- [ ] Confirm `src/benchmarking/metrics/metrics.agent.md` exists.
