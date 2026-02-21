# Task: Cost Heuristics TokenEstimate Accuracy Benchmark (Sub-Epic: 25_Benchmarking Suite Process and Performance Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-032]

## 1. Initial Test Written
- [ ] Create test file at `src/orchestrator/__tests__/token-estimate.bench.test.ts`.
- [ ] Write a unit test `tokenEstimate_returnsNumber` that calls `estimateTokens({ prompt: "hello world", model: "gemini-flash" })` and asserts the return value is a positive integer.
- [ ] Write a unit test `tokenEstimate_withinBudget` that asserts the estimate for a known 100-token prompt is within the range [75, 125] (±25%).
- [ ] Write a unit test `tokenEstimateAccuracy_foundation` that replays a saved fixture of 10 Foundation-milestone prompt/completion pairs from `fixtures/token-estimate-foundation.json` and asserts the mean absolute percentage error (MAPE) is ≤ 25% across all entries.
- [ ] Write a unit test `tokenEstimateAccuracy_recordsActual` that mocks the Gemini API response with `usageMetadata.totalTokenCount = 500` and verifies that after calling `runWithEstimate(...)`, the `TokenLedger` in SQLite has a row with `estimated_tokens`, `actual_tokens`, and `error_pct` columns populated.
- [ ] Write an integration test `benchmarkTokenEstimate_latency` that measures the wall-clock time of 100 consecutive `estimateTokens` calls and asserts median < 5ms (pure heuristic, no network).
- [ ] All tests must FAIL before implementation begins (Red-Phase Gate confirmed).

## 2. Task Implementation
- [ ] Create `src/orchestrator/token-estimator.ts` exporting:
  - `interface TokenEstimateInput { prompt: string; model: string; contextFiles?: string[] }`.
  - `function estimateTokens(input: TokenEstimateInput): number` — heuristic: split on whitespace + punctuation, multiply by a per-model factor (e.g., 1.3 for flash, 1.4 for pro), add `contextFiles` byte-length / 4.
  - `function recordActualUsage(taskId: string, estimated: number, actual: number): Promise<void>` — inserts/updates a `token_ledger` row in the SQLite state DB with `error_pct = ABS(estimated - actual) / actual * 100`.
- [ ] Create migration `migrations/0XX_create_token_ledger.sql` adding table: `token_ledger(task_id TEXT PRIMARY KEY, estimated_tokens INTEGER, actual_tokens INTEGER, error_pct REAL, recorded_at TEXT)`.
- [ ] Create `src/orchestrator/benchmark-runner.ts` (or extend existing) with `function runFoundationTokenBenchmark(): Promise<BenchmarkReport>` that:
  1. Loads all Foundation-milestone task fixtures from `fixtures/token-estimate-foundation.json`.
  2. Calls `estimateTokens` on each.
  3. Computes MAPE.
  4. Returns a `BenchmarkReport` with `{ metric: "cost-heuristics", mapePercent: number, pass: boolean }` where `pass = mapePercent <= 25`.
- [ ] Add fixture file `fixtures/token-estimate-foundation.json` with at least 10 prompt/actual-token pairs sampled from real Gemini API runs.
- [ ] Register the benchmark in `package.json` under `devs.benchmarks`: `"cost-heuristics": "vitest bench src/orchestrator/__tests__/token-estimate.bench.test.ts"`.

## 3. Code Review
- [ ] Verify `estimateTokens` has no network calls — pure synchronous computation.
- [ ] Confirm `recordActualUsage` uses parameterized SQL queries (no string interpolation) to prevent SQL injection.
- [ ] Verify the `token_ledger` migration is idempotent (`CREATE TABLE IF NOT EXISTS`).
- [ ] Confirm the per-model factor map is an exported constant so it can be tuned without code changes.
- [ ] Confirm MAPE calculation handles `actual = 0` safely (skip or mark as error).
- [ ] Ensure the benchmark report output matches the `BenchmarkReport` interface used by other benchmarks in this sub-epic.

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/orchestrator/__tests__/token-estimate.bench.test.ts` and confirm all tests pass.
- [ ] Run `npx vitest bench src/orchestrator/__tests__/token-estimate.bench.test.ts` and confirm median latency < 5ms.
- [ ] Run `npm run migrate` and confirm `token_ledger` table is created without error.
- [ ] Run `npm run lint` and confirm zero TypeScript strict-mode errors.

## 5. Update Documentation
- [ ] Create `src/orchestrator/token-estimator.agent.md` documenting: heuristic formula, per-model factors, MAPE threshold (25%), and how to update the fixture file.
- [ ] Update `docs/benchmarks/README.md` to add a row for `cost-heuristics` with threshold `MAPE ≤ 25%`.
- [ ] Add `# [9_ROADMAP-REQ-032]` comment above `estimateTokens` in source.

## 6. Automated Verification
- [ ] Run `node scripts/validate-all.js --benchmark cost-heuristics` and confirm exit code 0.
- [ ] Confirm `reports/benchmarks/cost-heuristics.json` contains `{ "mapePercent": <number>, "pass": true }`.
- [ ] Run `grep -r "9_ROADMAP-REQ-032" src/orchestrator/token-estimator.ts` and confirm the requirement ID appears in source.
