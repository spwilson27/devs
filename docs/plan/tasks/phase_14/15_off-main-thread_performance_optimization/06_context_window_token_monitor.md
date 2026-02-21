# Task: Implement Context Window Token Monitor (Sub-Epic: 15_Off-Main-Thread Performance Optimization)

## Covered Requirements
- [1_PRD-REQ-MET-010]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/__tests__/context-monitor.test.ts` using Vitest.
- [ ] Write a unit test for `ContextMonitor.measure(messages)`: given an array of messages whose combined token count (estimated via `tiktoken`) is 150,000, assert the function returns `{ tokens: 150000, exceedsThreshold: false }`.
- [ ] Write a unit test for `ContextMonitor.measure(messages)`: given messages totalling 210,000 tokens, assert `{ tokens: 210000, exceedsThreshold: true }`.
- [ ] Write a test asserting that `ContextMonitor.trim(messages, targetTokens)` returns a new messages array whose total token count is ≤ `targetTokens`, with the most recent messages retained and oldest pruned first.
- [ ] Write a test that verifies `ContextMonitor.trim()` never removes the system prompt (the first message with `role: 'system'`) regardless of the target token count.
- [ ] Write a test for `ContextWindowMetricsCollector.record(taskId, tokens)`: after recording 100 tasks, the method `getP90ExceedanceRate()` returns the correct fraction of tasks where `tokens > 200_000`.
- [ ] Write a test asserting that when the exceedance rate exceeds 10% (i.e., >10% of tasks have context > 200k tokens), `ContextMonitor` emits a `'threshold-exceeded-alert'` event with the current rate.
- [ ] Write a test for the `ContextOptimizationReport` type: assert that calling `generateReport()` returns an object with fields `p90ExceedanceRate`, `averageTokens`, and `trimOperations`.

## 2. Task Implementation
- [ ] Create `src/orchestrator/context-monitor.ts` exporting:
  - `ContextMonitor` class:
    - `measure(messages: ChatMessage[]): { tokens: number; exceedsThreshold: boolean }` — uses `tiktoken` (`cl100k_base` encoding) to count tokens. Threshold: 200,000. Annotate: `// [1_PRD-REQ-MET-010] Keep active context windows <200k tokens for 90% of tasks`.
    - `trim(messages: ChatMessage[], targetTokens: number): ChatMessage[]` — prunes oldest non-system messages until the total is at or below `targetTokens`. Always retains `role: 'system'` messages.
    - Extends `EventEmitter`; emits `'threshold-exceeded-alert'` with `{ rate: number }` when `getP90ExceedanceRate() > 0.10`.
  - `ContextWindowMetricsCollector` class:
    - `record(taskId: string, tokens: number): void` — stores in a rolling window of the last 1,000 tasks (use a circular buffer).
    - `getP90ExceedanceRate(): number` — returns fraction of recorded tasks with `tokens > 200_000`.
    - `generateReport(): ContextOptimizationReport`.
  - Export type `ContextOptimizationReport = { p90ExceedanceRate: number; averageTokens: number; trimOperations: number }`.
- [ ] Install `tiktoken` if not already a dependency: `pnpm add tiktoken`.
- [ ] Update the agent task execution loop in `src/orchestrator/task-executor.ts`:
  - Before each LLM API call, run `contextMonitor.measure(messages)`.
  - If `exceedsThreshold`, run `messages = contextMonitor.trim(messages, 180_000)` (targeting 180k to leave headroom) and log a warning with the original and trimmed token counts.
  - After each call, record `contextMonitor.metrics.record(taskId, tokens)`.
- [ ] Register `contextMonitor` as a singleton in the extension lifecycle; expose `contextMonitor.generateReport()` via the `inspect_state` MCP tool.

## 3. Code Review
- [ ] Verify `tiktoken` is used (not a naive character-count heuristic) for token estimation.
- [ ] Confirm the system prompt (`role: 'system'`) is never pruned by `trim()`.
- [ ] Verify the circular buffer in `ContextWindowMetricsCollector` caps at 1,000 entries to prevent unbounded memory growth.
- [ ] Confirm `'threshold-exceeded-alert'` events are not emitted more than once per minute (implement a debounce of 60,000ms to avoid alert storms).
- [ ] Verify `// [1_PRD-REQ-MET-010]` annotation is present on `measure()` and `trim()`.
- [ ] Confirm that `trim()` returns a **new** array (does not mutate the input).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/orchestrator/__tests__/context-monitor.test.ts` and confirm all tests pass.
- [ ] Run `pnpm test --coverage src/orchestrator/` and confirm coverage ≥ 90%.
- [ ] Run the full orchestrator integration test: `pnpm run test:orchestrator` and confirm no regressions in task execution.

## 5. Update Documentation
- [ ] Add a `### Context Window Token Monitor` section to `docs/architecture/performance.md` documenting the 200k threshold, the `trim()` pruning strategy, the metrics collector, and the alert mechanism.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "Context window monitoring active from Phase 14. Target: <200k tokens for 90% of tasks [1_PRD-REQ-MET-010]. Auto-trim to 180k on exceedance. Alert fired when >10% of last 1,000 tasks exceed threshold."
- [ ] Add `ContextOptimizationReport` to the `inspect_state` MCP tool response documentation.

## 6. Automated Verification
- [ ] Run `pnpm test src/orchestrator/__tests__/context-monitor.test.ts --reporter=json > /tmp/context-monitor-results.json && node -e "const r=require('/tmp/context-monitor-results.json'); if(r.numFailedTests>0) process.exit(1)"` and assert exit code 0.
- [ ] Run `grep -n "1_PRD-REQ-MET-010" src/orchestrator/context-monitor.ts` and assert at least 2 annotated lines exist.
- [ ] Run `grep -n "contextMonitor.measure" src/orchestrator/task-executor.ts` and assert at least 1 match (confirming integration in the execution loop).
