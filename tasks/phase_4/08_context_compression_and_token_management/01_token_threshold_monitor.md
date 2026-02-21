# Task: Implement Token Threshold Monitor and Warning System (Sub-Epic: 08_Context_Compression_and_Token_Management)

## Covered Requirements
- [3_MCP-TAS-049], [1_PRD-REQ-PERF-001], [1_PRD-REQ-SYS-001]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/compression/__tests__/token-threshold-monitor.test.ts`.
- [ ] Write a unit test that instantiates `TokenThresholdMonitor` with a mock token counter and asserts that when the current token count is below 600k, no event is emitted.
- [ ] Write a unit test asserting that when the token count crosses 600k (warning threshold), the monitor emits a `'threshold:warning'` event with the current token count and the threshold value.
- [ ] Write a unit test asserting that when the token count crosses 800k (compression threshold), the monitor emits a `'threshold:compression'` event with the current token count.
- [ ] Write a unit test asserting that both events are NOT emitted twice for the same crossing (i.e., hysteresis: only emit once per crossing, not on every subsequent token update while over the threshold).
- [ ] Write a unit test that confirms the monitor resets its "fired" state correctly when the token count drops back below the threshold.
- [ ] Write integration tests in `packages/memory/src/compression/__tests__/token-threshold-monitor.integration.test.ts` verifying that the monitor hooks into the live `ContextWindowTracker` (see Phase 4 deliverables) and fires the correct events during a simulated multi-turn agent conversation.

## 2. Task Implementation
- [ ] Create the file `packages/memory/src/compression/token-threshold-monitor.ts`.
- [ ] Define and export a `TokenThresholds` interface:
  ```typescript
  export interface TokenThresholds {
    warning: number;   // default: 600_000
    compression: number; // default: 800_000
  }
  ```
- [ ] Define and export a `TokenThresholdMonitor` class that extends `EventEmitter`.
- [ ] The constructor should accept `thresholds: Partial<TokenThresholds>` (defaulting to `{ warning: 600_000, compression: 800_000 }`) and a `getCurrentTokenCount: () => number` callback.
- [ ] Implement a `check()` method that:
  1. Calls `getCurrentTokenCount()`.
  2. If count >= `thresholds.compression` and the compression event has not been fired in the current crossing, emits `'threshold:compression'` with `{ currentTokens: number, threshold: number }`.
  3. Else if count >= `thresholds.warning` and the warning event has not been fired in the current crossing, emits `'threshold:warning'` with `{ currentTokens: number, threshold: number }`.
  4. If count falls below `thresholds.warning`, resets the fired flags so events can fire again on the next crossing.
- [ ] Implement a `startPolling(intervalMs: number)` method that calls `check()` on a `setInterval`.
- [ ] Implement a `stopPolling()` method that clears the interval.
- [ ] Export from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Confirm there are NO magic numbers in the implementation; all thresholds must come from the `TokenThresholds` interface with documented defaults.
- [ ] Confirm `EventEmitter` is used correctly and that event payloads are strictly typed (use `declare interface TokenThresholdMonitor` overloads or a typed emitter library).
- [ ] Confirm hysteresis logic is correct: events must fire only on the transition edge, not repeatedly while over the threshold.
- [ ] Confirm `startPolling` / `stopPolling` do not leak intervals (call `stopPolling` in tests).
- [ ] Confirm the class is fully unit-testable without needing a real agent runtime.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test --testPathPattern="token-threshold-monitor"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/memory test:coverage` and confirm the new module has >= 90% line and branch coverage.

## 5. Update Documentation
- [ ] Add a `## Token Threshold Monitor` section to `packages/memory/README.md` describing the two thresholds (600k warning, 800k compression), how to configure them, and which events are emitted.
- [ ] Update `docs/architecture/context-management.md` (create if absent) to note that token threshold monitoring is a prerequisite for automatic context compression.

## 6. Automated Verification
- [ ] CI pipeline step `pnpm --filter @devs/memory test` must exit with code 0.
- [ ] Run `node -e "const m = require('./packages/memory/dist'); console.assert(typeof m.TokenThresholdMonitor === 'function')"` to verify the export is present in the built output.
