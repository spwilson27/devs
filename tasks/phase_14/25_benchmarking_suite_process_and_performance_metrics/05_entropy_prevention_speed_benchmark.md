# Task: Entropy Prevention Speed Benchmark (Sub-Epic: 25_Benchmarking Suite Process and Performance Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-035]

## 1. Initial Test Written
- [ ] Create test file at `src/orchestrator/__tests__/entropy-detector.bench.test.ts`.
- [ ] Write a unit test `entropyDetector_noLoopDetected_singleTurn` that calls `detectLoop({ taskId: "task-001", outputHash: "abc123" })` once and asserts `LoopDetectionResult.loopDetected === false`.
- [ ] Write a unit test `entropyDetector_noLoopDetected_differentHashes` that calls `detectLoop` twice with different hashes for the same task and asserts no loop is detected.
- [ ] Write a unit test `entropyDetector_loopDetected_sameHashTwice` that calls `detectLoop` with the same `outputHash` for `task-001` twice in a row and asserts `LoopDetectionResult.loopDetected === true` on the second call.
- [ ] Write a unit test `entropyDetector_pausesOrchestrator` that asserts when `loopDetected === true`, calling `handleLoopDetected({ taskId, orchestratorRef })` invokes `orchestratorRef.pause()` exactly once within a single orchestrator turn (no delay loop).
- [ ] Write an integration test `benchmarkEntropyDetector_pauseWithinOneTurn` that simulates 3 orchestrator turns where turn 2 and 3 produce identical output hashes, and asserts the orchestrator is in `"paused"` state by the end of turn 3 (i.e., loop caught within 1 turn of detection).
- [ ] Write a benchmark test measuring `detectLoop` latency for a ledger of 10,000 prior hashes, asserting p95 < 1ms (pure hash-map lookup).
- [ ] All tests must FAIL before implementation begins (Red-Phase Gate confirmed).

## 2. Task Implementation
- [ ] Create `src/orchestrator/entropy-detector.ts` exporting:
  - `interface LoopDetectionResult { loopDetected: boolean; matchedHash?: string; taskId: string }`.
  - `interface EntropyDetectorState` — wraps a `Map<string, string>` of `taskId → lastOutputHash`.
  - `function createEntropyDetector(): EntropyDetector` — factory returning an instance with methods:
    - `detectLoop(input: { taskId: string; outputHash: string }): LoopDetectionResult` — compares `outputHash` against the stored previous hash for `taskId`. If match, returns `loopDetected: true`. Always updates the stored hash after comparison.
    - `reset(taskId: string): void` — clears stored hash for a task (used after successful task completion).
  - `async function handleLoopDetected(input: { taskId: string; orchestratorRef: OrchestratorHandle }): Promise<void>` — calls `orchestratorRef.pause({ reason: "entropy-loop", taskId })` and logs the event to the `entropy_events` SQLite table.
- [ ] Create migration `migrations/0XX_create_entropy_events.sql` adding table: `entropy_events(id INTEGER PRIMARY KEY AUTOINCREMENT, task_id TEXT, detected_at TEXT, output_hash TEXT, turn_index INTEGER)`.
- [ ] Integrate `EntropyDetector` into the orchestrator's `TDDLoop`: after each agent turn, compute `outputHash = sha256(agentOutput)` and call `detectLoop`. If `loopDetected`, immediately call `handleLoopDetected` — this must happen in the same turn (no deferred async).
- [ ] Create `src/orchestrator/benchmark-entropy-prevention.ts` exporting `runEntropyPreventionBenchmark(): Promise<BenchmarkReport>` that:
  1. Creates a mock orchestrator that runs 5 turns, with turns 3 and 4 producing identical output.
  2. Asserts the orchestrator pauses at turn 4 (within 1 turn of the first repeated hash).
  3. Returns `{ metric: "entropy-prevention", pausedWithinOneTurn: boolean, detectionLatencyMs: number, pass: boolean }` where `pass = pausedWithinOneTurn && detectionLatencyMs < 1`.
- [ ] Register in `package.json` under `devs.benchmarks`: `"entropy-prevention": "vitest bench src/orchestrator/__tests__/entropy-detector.bench.test.ts"`.

## 3. Code Review
- [ ] Verify `detectLoop` is a synchronous operation with O(1) hash-map lookup — no database calls in the hot path.
- [ ] Confirm `handleLoopDetected` is awaited in the same orchestrator turn and cannot be deferred or debounced.
- [ ] Verify `sha256` hashing uses Node.js built-in `crypto.createHash('sha256')` — no third-party library.
- [ ] Confirm `entropy_events` migration is idempotent (`CREATE TABLE IF NOT EXISTS`).
- [ ] Verify `reset` is called on successful task completion to prevent false positives across tasks.
- [ ] Confirm `OrchestratorHandle` is an interface (not a concrete class) to allow mocking in tests.

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/orchestrator/__tests__/entropy-detector.bench.test.ts` and confirm all tests pass.
- [ ] Run `npx vitest bench src/orchestrator/__tests__/entropy-detector.bench.test.ts` and confirm p95 < 1ms for `detectLoop`.
- [ ] Run `npm run migrate` and confirm `entropy_events` table is created without error.
- [ ] Run `npm run lint` and confirm zero TypeScript strict-mode errors.

## 5. Update Documentation
- [ ] Create `src/orchestrator/entropy-detector.agent.md` documenting: loop detection algorithm (hash-map comparison), SHA-256 hashing of agent output, the "within 1 turn" guarantee, and `entropy_events` schema.
- [ ] Update `docs/benchmarks/README.md` to add a row for `entropy-prevention` with threshold `pause within 1 turn of hash-match loop detection, p95 detectLoop < 1ms`.
- [ ] Add `# [9_ROADMAP-REQ-035]` comment above `detectLoop` in source.

## 6. Automated Verification
- [ ] Run `node scripts/validate-all.js --benchmark entropy-prevention` and confirm exit code 0.
- [ ] Confirm `reports/benchmarks/entropy-prevention.json` contains `{ "pausedWithinOneTurn": true, "detectionLatencyMs": <number>, "pass": true }` with `detectionLatencyMs < 1`.
- [ ] Run `grep -r "9_ROADMAP-REQ-035" src/orchestrator/entropy-detector.ts` and confirm the requirement ID appears in source.
