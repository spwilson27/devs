# Task: Implement Token Threshold Monitor and 800k Context Refresh Trigger (Sub-Epic: 11_Memory_Refresher_and_Summarization)

## Covered Requirements
- [4_USER_FEATURES-REQ-083]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/monitor/__tests__/TokenThresholdMonitor.test.ts`.
- [ ] Write a unit test that instantiates `TokenThresholdMonitor` with a `threshold` of `800_000` tokens and a mock `onThresholdExceeded` callback.
- [ ] Write a unit test for `TokenThresholdMonitor.record(tokens: number)`:
  - Assert that calling `record()` with values totalling < 800,000 does NOT invoke the callback.
  - Assert that calling `record()` such that the cumulative total reaches or exceeds 800,000 invokes the callback exactly once with a `ContextRefreshEvent` argument containing `{ totalTokens, triggeredAt }`.
- [ ] Write a unit test asserting that after the callback fires, `reset()` is called internally and subsequent `record()` calls restart the accumulator from zero (i.e., the callback fires again only after another 800,000 tokens are accumulated, not immediately).
- [ ] Write a unit test for `TokenThresholdMonitor.getAccumulatedTokens()`: assert it returns the current running total.
- [ ] Write an integration test in `packages/memory/src/__tests__/integration/TokenThresholdMonitor.integration.test.ts` that wires `TokenThresholdMonitor` to a real `SummarizationHandoff` mock and verifies that `SummarizationHandoff.transfer()` is called when the threshold is exceeded.

## 2. Task Implementation

- [ ] Create `packages/memory/src/monitor/types.ts`:
  ```ts
  export interface ContextRefreshEvent {
    totalTokens: number;
    triggeredAt: Date;
  }

  export type ThresholdCallback = (event: ContextRefreshEvent) => Promise<void>;

  export interface TokenThresholdMonitorConfig {
    thresholdTokens: number;        // Default: 800_000
    onThresholdExceeded: ThresholdCallback;
  }
  ```
- [ ] Create `packages/memory/src/monitor/TokenThresholdMonitor.ts`:
  - Private field `accumulated: number = 0`.
  - Constructor accepts `TokenThresholdMonitorConfig`, defaults `thresholdTokens` to `800_000` if not provided.
  - `record(tokens: number): Promise<void>`:
    1. Add `tokens` to `accumulated`.
    2. If `accumulated >= thresholdTokens`:
       a. Capture `event: ContextRefreshEvent = { totalTokens: accumulated, triggeredAt: new Date() }`.
       b. Call `reset()`.
       c. Await `onThresholdExceeded(event)`.
  - `reset(): void`: sets `accumulated = 0`.
  - `getAccumulatedTokens(): number`: returns `accumulated`.
- [ ] Create `packages/memory/src/monitor/tokenCounter.ts` with a utility function `countTokens(text: string): number` that implements a byte-pair approximation: `Math.ceil(text.length / 4)`. This is intentionally a fast heuristic; exact tiktoken counting is deferred to a later phase.
- [ ] Wire `TokenThresholdMonitor` into the orchestrator's agent execution loop in `packages/orchestrator/src/AgentRunner.ts`:
  - After each LLM response is received, call `tokenMonitor.record(countTokens(response.text))`.
  - The `onThresholdExceeded` callback must call `SummarizationHandoff.transfer(agentId, recentTurns)` and then re-inject the resulting summary into the agent's context window as a synthetic `user` turn with prefix `[CONTEXT REFRESH]`.
- [ ] Export `TokenThresholdMonitor` and `countTokens` from `packages/memory/src/index.ts`.

## 3. Code Review

- [ ] Verify that `record()` is safe to call concurrently — if the orchestrator runs parallel sub-agents, multiple `record()` calls may race. The accumulator must be protected (use an atomic counter pattern or ensure single-threaded access is documented clearly).
- [ ] Verify that the callback is awaited before `record()` returns to prevent the threshold from firing multiple times before the refresh completes.
- [ ] Verify that `reset()` is called BEFORE the callback (not after) to ensure that tokens recorded during the async callback execution are attributed to the next window.
- [ ] Verify that the orchestrator re-injection of the `[CONTEXT REFRESH]` summary does not recursively trigger another token count (the injected summary tokens must bypass the monitor).
- [ ] Verify that `countTokens` is exposed as a dependency injection point (not hardcoded) so it can be swapped for a more accurate counter later without changing `TokenThresholdMonitor`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test` and confirm all `TokenThresholdMonitor` unit tests pass.
- [ ] Run `pnpm --filter @devs/memory test:integration` to confirm integration test passes.
- [ ] Run `pnpm --filter @devs/orchestrator test` to ensure `AgentRunner` tests still pass after wiring.
- [ ] Run `pnpm --filter @devs/memory build && pnpm --filter @devs/orchestrator build` to confirm no TypeScript errors.

## 5. Update Documentation

- [ ] Add a `## Token Threshold Monitor` section to `packages/memory/README.md` describing the 800k default threshold, the `record()` API, and the `[CONTEXT REFRESH]` injection mechanism.
- [ ] Update `docs/agent-memory/tiered-memory.md` to document the token threshold trigger as the entry point for the summarization handoff pipeline per `[4_USER_FEATURES-REQ-083]`.
- [ ] Note in `docs/agent-memory/tiered-memory.md` that the `countTokens` heuristic (length/4) is an intentional approximation and reference the ADR for future tiktoken integration.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json --outputFile=test-results/token-threshold-monitor.json` and confirm zero `failed` entries.
- [ ] Confirm that `packages/memory/src/monitor/TokenThresholdMonitor.ts` exists and exports `TokenThresholdMonitor` by running `grep -r "export.*TokenThresholdMonitor" packages/memory/src/`.
- [ ] Run the orchestrator smoke test `pnpm --filter @devs/orchestrator test:smoke` and confirm no regressions.
