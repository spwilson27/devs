# Task: Integrate Context Compression Pipeline into Orchestrator (Sub-Epic: 08_Context_Compression_and_Token_Management)

## Covered Requirements
- [3_MCP-TAS-049], [1_PRD-REQ-PERF-001], [1_PRD-REQ-CON-004], [1_PRD-REQ-SYS-001], [1_PRD-REQ-REL-006]

## 1. Initial Test Written
- [ ] Create `packages/orchestrator/src/__tests__/context-compression-pipeline.test.ts`.
- [ ] Write a unit test that constructs the `ContextCompressionPipeline` with mocked `TokenThresholdMonitor`, `SlidingRelevanceWindow`, `ContextCompressor`, and `TokenBudgetEnforcer` and verifies the pipeline calls them in the correct order on each turn:
  1. `enforcer.record(turn.tokenCount)` → `enforcer.check()`
  2. `monitor.check()`
  3. On `'threshold:warning'` event: log a warning only (no compression).
  4. On `'threshold:compression'` event: call `slidingWindow.prune(turns)` then `compressor.compress(prunedTurns)` and replace the active turn list with the result.
- [ ] Write a unit test asserting that compression is NOT triggered when token count is between 600k and 800k (warning range only).
- [ ] Write a unit test asserting that after compression, the `CompressedContext.summary` is prepended as a synthetic `'summary'` turn at the front of the active turn list.
- [ ] Write a unit test asserting that `TokenBudgetExceededError` from the enforcer bubbles up through the pipeline and causes the orchestrator to record a `'budget_exceeded'` failure status in SQLite.
- [ ] Write an E2E test in `packages/orchestrator/src/__tests__/context-compression-pipeline.e2e.test.ts` that simulates a 150-turn task, verifies compression fires at turn ~80 (when tokens exceed 800k in the simulation), and confirms the final turn list is < 800k tokens.

## 2. Task Implementation
- [ ] Create `packages/orchestrator/src/context-compression-pipeline.ts`.
- [ ] Define and export `ContextCompressionPipeline`:
  ```typescript
  export class ContextCompressionPipeline {
    constructor(
      private readonly monitor: TokenThresholdMonitor,
      private readonly slidingWindow: SlidingRelevanceWindow,
      private readonly compressor: ContextCompressor,
      private readonly enforcer: TokenBudgetEnforcer,
      private readonly logger: Logger,
    ) {}

    async processTurn(turn: Turn, activeTurns: Turn[]): Promise<Turn[]>
  }
  ```
- [ ] Implement `processTurn`:
  1. Call `enforcer.record(turn.tokenCount)` and `enforcer.check()`.
  2. Push `turn` onto a local copy of `activeTurns`.
  3. Call `monitor.check()`.
  4. If the monitor has emitted `'threshold:warning'`, call `logger.warn(...)`.
  5. If the monitor has emitted `'threshold:compression'`:
     a. Call `await slidingWindow.prune(activeTurns)`.
     b. Call `await compressor.compress(prunedTurns)`.
     c. Build a `summaryTurn: Turn` with `type: 'summary'`, `content: compressedContext.summary`, `tokenCount: estimateTokens(compressedContext.summary)`.
     d. Replace `activeTurns` with `[summaryTurn, ...compressedContext.retainedTurns]`.
     e. Log `INFO` with `tokensSaved`.
  6. Return the (possibly compressed) `activeTurns`.
- [ ] Wire `ContextCompressionPipeline` into `packages/orchestrator/src/task-runner.ts`: replace the raw turn-append logic with a call to `pipeline.processTurn(turn, activeTurns)`.
- [ ] Export `ContextCompressionPipeline` from `packages/orchestrator/src/index.ts`.

## 3. Code Review
- [ ] Confirm the pipeline never mutates the input `activeTurns` array (always returns a new array).
- [ ] Confirm compression fires exactly once per threshold crossing (delegated to `TokenThresholdMonitor`'s hysteresis logic).
- [ ] Confirm the `summaryTurn` is always the first element of the returned array after compression.
- [ ] Confirm `TokenBudgetExceededError` is caught at the task-runner level, not swallowed in `processTurn`.
- [ ] Confirm the E2E test uses realistic token estimates (e.g., `Math.ceil(content.length / 4)` as a simple proxy).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/orchestrator test --testPathPattern="context-compression-pipeline"` and confirm all tests pass.
- [ ] Run the E2E test and confirm compression fires at the expected turn.

## 5. Update Documentation
- [ ] Update `packages/orchestrator/README.md` with a `## Context Compression Pipeline` section explaining the 600k warning / 800k compression thresholds, the order of operations, and the resulting turn list structure after compression.
- [ ] Update `docs/architecture/context-management.md` with an end-to-end sequence diagram (Mermaid) of the full pipeline from agent turn emission to compressed context assembly.

## 6. Automated Verification
- [ ] CI step `pnpm --filter @devs/orchestrator test` exits with code 0.
- [ ] Verify export: `node -e "const m = require('./packages/orchestrator/dist'); console.assert(typeof m.ContextCompressionPipeline === 'function')"`.
- [ ] Run the E2E test in CI with `pnpm --filter @devs/orchestrator test:e2e` and confirm it exits with code 0.
