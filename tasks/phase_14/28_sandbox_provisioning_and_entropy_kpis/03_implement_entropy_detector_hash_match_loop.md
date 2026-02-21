# Task: Implement EntropyDetector with Hash-Match Loop Detection and Auto-Pause (Sub-Epic: 28_Sandbox Provisioning and Entropy KPIs)

## Covered Requirements
- [1_PRD-REQ-GOAL-006]

## 1. Initial Test Written
- [ ] In `src/orchestrator/__tests__/entropy-detector.test.ts`, write unit tests for an `EntropyDetector` class:
  - `describe('EntropyDetector.observe()')`:
    - Test that calling `observe(output)` with three distinct outputs does NOT trigger a `'loop_detected'` event.
    - Test that calling `observe(output)` with the same output three times in a row triggers a `'loop_detected'` event with payload `{ attemptCount: 3, lastHash: string }`.
    - Test that calling `observe(output)` with two identical outputs followed by one different output does NOT trigger `'loop_detected'`.
    - Test that after a loop is detected and `reset()` is called, three new identical outputs again trigger `'loop_detected'` (detector is reusable).
  - `describe('EntropyDetector hashing')`:
    - Test that `hashOutput(str)` returns a consistent SHA-256 hex string for the same input.
    - Test that `hashOutput(str)` returns different values for different inputs.
  - `describe('EntropyDetector integration with orchestrator pause')`:
    - Mock the orchestrator `pause()` method.
    - Assert that when `'loop_detected'` fires, the orchestrator's `pause()` is called with a reason string containing `'entropy'`.
    - Assert that `pause()` is called exactly once per detection event (not multiple times for the same loop).
- [ ] In `src/orchestrator/__tests__/entropy-detector.integration.test.ts`:
  - Simulate a full 5-turn loop (same output repeated 5 times) and assert the detector fires on turn 3 and NOT on turns 4 or 5 (once paused, subsequent detections are suppressed until `reset()`).

## 2. Task Implementation
- [ ] Create `src/orchestrator/entropy-detector.ts`:
  - Import `createHash` from `'node:crypto'` and `EventEmitter` from `'node:events'`.
  - Export interface `LoopDetectedPayload { attemptCount: number; lastHash: string; taskId: string; }`.
  - Implement `EntropyDetector extends EventEmitter`:
    - Private `window: string[] = []` (rolling hash window, max size 3).
    - Private `paused = false`.
    - `hashOutput(output: string): string` — returns `createHash('sha256').update(output).digest('hex')`.
    - `observe(output: string, taskId: string): void`:
      - If `paused`, return immediately (no-op).
      - Push `hashOutput(output)` into `window`; keep only the last 3.
      - If `window.length === 3` and all 3 hashes are equal, set `paused = true` and emit `'loop_detected'` with `{ attemptCount: window.length, lastHash: window[0], taskId }`.
    - `reset(): void` — clears `window`, sets `paused = false`.
- [ ] Create `src/orchestrator/entropy-pause-handler.ts`:
  - Export `createEntropyPauseHandler(orchestrator: { pause: (reason: string) => void }): (payload: LoopDetectedPayload) => void`.
  - The handler calls `orchestrator.pause(\`Entropy loop detected for task \${payload.taskId}: hash \${payload.lastHash} repeated \${payload.attemptCount} times\`)`.
- [ ] Wire `EntropyDetector` into the main TDD task-execution loop (e.g., `src/orchestrator/task-runner.ts`):
  - Instantiate one `EntropyDetector` per task run.
  - After each terminal output is captured, call `detector.observe(output, task.id)`.
  - Attach `createEntropyPauseHandler(orchestrator)` to the `'loop_detected'` event.
  - Call `detector.reset()` when a task completes or is rewound.

## 3. Code Review
- [ ] Verify the hash window is strictly length-3 (no off-by-one): test with exactly 2 then 3 identical hashes.
- [ ] Confirm `paused` flag prevents duplicate `'loop_detected'` emissions for the same loop.
- [ ] Ensure `reset()` fully clears state so the detector is reusable across task re-tries.
- [ ] Verify `hashOutput` uses SHA-256 (not MD5 or weaker).
- [ ] Confirm the requirement comment `// [1_PRD-REQ-GOAL-006]` appears above the `observe()` method.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/orchestrator/__tests__/entropy-detector.test.ts` — all unit tests must pass.
- [ ] Run `pnpm test src/orchestrator/__tests__/entropy-detector.integration.test.ts` — integration tests must pass.
- [ ] Run `pnpm tsc --noEmit` — zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/orchestrator/entropy-detector.agent.md` documenting: the 3-output rolling-window algorithm, SHA-256 hashing rationale, `'loop_detected'` event payload, and how to hook in a custom handler.
- [ ] Update `docs/architecture/orchestrator.md` (or create if absent) with a section "Entropy Detection" describing the detection strategy and automatic pause behaviour.
- [ ] Update `docs/architecture/kpis.md` with a section "Entropy Detection KPI" referencing the window size and the pause threshold.

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/orchestrator` and confirm coverage ≥ 90% for `entropy-detector.ts` and `entropy-pause-handler.ts`.
- [ ] Run `pnpm run validate-all` and confirm exit code 0.
- [ ] Write and run a quick smoke-test script `scripts/smoke-entropy-detector.ts` that observes three identical strings and asserts the emitted event payload matches expectations, then delete the script.
