# Task: Implement Memory Efficiency Benchmark for ContextPruner (Sub-Epic: 18_Performance_and_Benchmarking)

## Covered Requirements
- [9_ROADMAP-REQ-019]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/context-pruner-benchmark.test.ts`, write a benchmark/integration test for `ContextPruner`:
  - Define a helper `generateSyntheticContext(tokenCount: number): ConversationTurn[]` that produces a realistic array of conversation turns totaling approximately `tokenCount` tokens (use a fixed token-per-word ratio of 0.75 for estimation).
  - Test: When given a synthetic context of exactly 1,000,000 tokens, `ContextPruner.compress(context)` returns a summary whose token count is `< 200,000`.
  - Test: The compressed output contains all strings tagged as P3 (Must-have) in the input (simulate by injecting sentinel strings like `"[P3-REQ-001]"` into the synthetic turns and asserting they appear in the output).
  - Test: `ContextPruner.compress()` resolves within a configurable timeout (default: 120 seconds) — assert the Promise resolves without throwing a `TimeoutError`.
  - Test: `ContextPruner.getLastCompressionStats()` returns a `CompressionStats` object with fields: `inputTokens`, `outputTokens`, `compressionRatio`, `durationMs`, `p3RetentionRate` (assert `compressionRatio < 0.2` and `p3RetentionRate >= 1.0`).
  - Write a separate unit test that `ContextPruner` throws `CompressionError` if the compressed output exceeds 200k tokens (mock the Flash model to return an oversized response).

## 2. Task Implementation
- [ ] Create `packages/memory/src/benchmark/ContextPrunerBenchmark.ts`:
  - Export `runMemoryEfficiencyBenchmark(pruner: ContextPruner, targetInputTokens: number): Promise<BenchmarkReport>`.
  - `BenchmarkReport` interface: `{ inputTokens: number; outputTokens: number; compressionRatio: number; durationMs: number; p3RetentionRate: number; passed: boolean; failureReason?: string; }`.
  - The benchmark generates synthetic context via `generateSyntheticContext`, runs `pruner.compress()`, computes all stats, and sets `passed = outputTokens < 200_000 && p3RetentionRate >= 1.0`.
- [ ] Update `packages/memory/src/ContextPruner.ts` (create if absent):
  - Add `getLastCompressionStats(): CompressionStats` method that returns the stats from the most recent `compress()` call.
  - Add internal stat tracking: record `inputTokens`, `outputTokens`, start/end timestamps, and a `p3RetentionRate` computed by checking the presence of P3-tagged content in the output.
  - Implement `compress(context: ConversationTurn[]): Promise<string>`:
    - Estimate token count using a `TokenEstimator` utility (characters / 4 as a rough estimate).
    - If estimated tokens < 200k, return raw context stringified without calling Flash model.
    - Otherwise, chunk the context, call `GeminiFlashClient.summarize(chunk)` for each chunk, merge summaries, verify final token count.
    - If final token count ≥ 200k, throw `CompressionError('Output exceeds 200k token limit')`.
- [ ] Create `packages/memory/src/benchmark/generateSyntheticContext.ts`:
  - Export `generateSyntheticContext(targetTokens: number, p3SentinelCount?: number): ConversationTurn[]`.
  - Distribute P3 sentinels evenly across the generated turns so they survive realistic summarization.
- [ ] Add a CLI script `scripts/benchmark-memory-efficiency.ts`:
  - Instantiate `ContextPruner` with the real `GeminiFlashClient`.
  - Call `runMemoryEfficiencyBenchmark(pruner, 1_000_000)`.
  - Print the `BenchmarkReport` as JSON to stdout and exit with code `0` if `passed`, `1` if not.

## 3. Code Review
- [ ] Verify `ContextPruner.compress()` never calls the Flash model when the input is already under 200k tokens (guard clause at top of method).
- [ ] Confirm `generateSyntheticContext` is deterministic (no `Math.random()` without a seed) so benchmarks are reproducible.
- [ ] Ensure `BenchmarkReport.compressionRatio` is computed as `outputTokens / inputTokens` (not inverted).
- [ ] Verify the benchmark script exits non-zero on failure — do not swallow errors.
- [ ] Confirm `ContextPruner` does not import from `packages/orchestrator` to keep the dependency graph acyclic.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="context-pruner-benchmark"` and confirm all tests pass (mock the Flash model with a deterministic stub that returns a <200k token summary).
- [ ] Run `pnpm --filter @devs/memory test -- --coverage` and confirm coverage for `ContextPruner.ts` and `ContextPrunerBenchmark.ts` is ≥ 85%.

## 5. Update Documentation
- [ ] Add JSDoc to `ContextPrunerBenchmark.ts` referencing `[9_ROADMAP-REQ-019]` and describing the pass/fail criteria: output < 200k tokens, P3 retention rate = 100%.
- [ ] Add a section "Memory Efficiency Benchmark" to `packages/memory/AGENT.md` describing: how to run `scripts/benchmark-memory-efficiency.ts`, what `BenchmarkReport` fields mean, and the pass criteria.
- [ ] Update `.devs/memory/phase_4_decisions.md` with: "`ContextPruner` has a verified benchmark: 1M token input → <200k token output with 100% P3 retention. Run `tsx scripts/benchmark-memory-efficiency.ts` to validate."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test 2>&1 | tail -5` and confirm zero failures.
- [ ] Run `grep -n "CompressionError" packages/memory/src/ContextPruner.ts` and confirm it is thrown when output exceeds 200k tokens.
- [ ] Run `node -e "const r = require('./scripts/benchmark-memory-efficiency'); r.main && r.main()" 2>&1 | grep '"passed"'` (or equivalent `tsx` invocation) and confirm the output contains `"passed": true` when using the stub Flash client.
