# Task: Validate ContextPruner Architectural Intent Maintenance Across 100+ Turns (Sub-Epic: 10_Spec_Refresh_Protocol)

## Covered Requirements
- [9_ROADMAP-BLOCKER-001]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/intentDriftBenchmark.test.ts`, write a deterministic benchmark/integration test (no LLM calls — use synthetic messages):
  - **Setup**: Create 10 distinct "architectural rules" as strings (e.g., `"RULE_01: Always use PostgreSQL"`, `"RULE_02: Never use global state"`, …, `"RULE_10: All API routes must be versioned"`). Embed each rule once in the first 10 messages.
  - **Noise simulation**: Generate 90 additional synthetic `assistant` and `user` messages that do NOT contain any of the 10 rules, simulating organic conversation drift.
  - **Processing**: Feed all 100 messages sequentially through `contextPruner.processTurn()`. The pruner is configured with the 10 rules injected into both the TAS and PRD documents used by `SpecRefreshService`.
  - **Assertion — spec refresh anchor**: After turn 100, call `contextWindow.getMessages()` and assert the final context contains exactly one `<!-- SPEC_REFRESH_START -->` block.
  - **Assertion — rule presence**: For each of the 10 rules, assert the string is findable in the final context (either in the refresh block or retained messages). This is the primary success criterion for `9_ROADMAP-BLOCKER-001`.
  - **Assertion — token budget**: Assert the total character count of the final context does not exceed `800_000 * 4` (approximate character equivalent of 800k tokens).
  - **Regression test**: If any assertion fails, the test should output which specific rule(s) were lost, to aid debugging.

## 2. Task Implementation
- [ ] Create `packages/memory/src/intentDriftBenchmark.ts` (used by tests and the smoke script):
  - Export `runIntentDriftBenchmark(pruner: ContextPruner, rules: string[], totalTurns: number): Promise<BenchmarkResult>`:
    ```ts
    export interface BenchmarkResult {
      totalTurns: number;
      rulesRetained: string[];
      rulesLost: string[];
      finalContextLength: number;
      specRefreshBlockCount: number;
      passed: boolean;
    }
    ```
  - Internally generates synthetic messages (first N messages embed rules, remaining are noise), feeds them through `pruner.processTurn()`, then checks the final context for each rule.
- [ ] Create a CLI smoke script `packages/memory/scripts/intent-drift-benchmark.ts`:
  - Instantiates `ContextPruner` with real TAS/PRD paths from `process.env.DEVS_TAS_PATH` and `process.env.DEVS_PRD_PATH`.
  - Runs `runIntentDriftBenchmark` with 10 rules and 100 turns.
  - Prints a JSON result to stdout.
  - Exits with code 1 if `result.passed === false` (for CI integration).
- [ ] Add a `"benchmark:intent-drift"` npm script to `packages/memory/package.json`:
  ```json
  "benchmark:intent-drift": "ts-node scripts/intent-drift-benchmark.ts"
  ```

## 3. Code Review
- [ ] Verify `runIntentDriftBenchmark` is deterministic — given the same `rules` and `totalTurns`, it must always produce the same `BenchmarkResult` without any randomness or LLM calls.
- [ ] Confirm `BenchmarkResult.rulesLost` lists all failed rules (not just the first one), enabling targeted debugging.
- [ ] Verify the benchmark script reads paths from environment variables, not hardcoded strings.
- [ ] Confirm the test in `intentDriftBenchmark.test.ts` asserts `result.rulesLost.length === 0` (not just `result.passed === true`) to produce a more informative failure message.
- [ ] Confirm the benchmark can be run in CI without any external services (SQLite in-memory, file system mocked or using temp files).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=intentDriftBenchmark` — all assertions pass, zero skips.
- [ ] Run `pnpm --filter @devs/memory test -- --coverage` — `intentDriftBenchmark.ts` has ≥ 90% line coverage.
- [ ] Run the benchmark script end-to-end with test fixtures: `DEVS_TAS_PATH=fixtures/fake_tas.md DEVS_PRD_PATH=fixtures/fake_prd.md pnpm --filter @devs/memory benchmark:intent-drift` — exits 0 and prints JSON with `"passed": true`.

## 5. Update Documentation
- [ ] Create `docs/agent-memory/intent-drift-benchmark.md` documenting:
  - The purpose of the benchmark (validating `9_ROADMAP-BLOCKER-001`).
  - How to run it locally and in CI.
  - The success criteria (all rules retained, single refresh block, token budget respected).
  - How to interpret `rulesLost` output when the benchmark fails.
- [ ] Add a CI job entry to `.github/workflows/memory-benchmarks.yml` that runs the intent drift benchmark on every PR that touches `packages/memory/`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory build` — zero TypeScript errors.
- [ ] Run the benchmark with the `--ci` flag (or environment): `CI=true DEVS_TAS_PATH=fixtures/fake_tas.md DEVS_PRD_PATH=fixtures/fake_prd.md pnpm --filter @devs/memory benchmark:intent-drift` — exits 0.
- [ ] Parse the JSON output and assert `passed: true` in the CI pipeline using: `pnpm --filter @devs/memory benchmark:intent-drift | node -e "const r=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); process.exit(r.passed ? 0 : 1)"`.
