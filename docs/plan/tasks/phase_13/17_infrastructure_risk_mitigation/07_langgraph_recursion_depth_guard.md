# Task: Implement LangGraph Recursion Depth Guard and Memory-Efficient Execution Strategy (Sub-Epic: 17_Infrastructure Risk Mitigation)

## Covered Requirements
- [9_ROADMAP-RISK-401]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/__tests__/recursionGuard.test.ts` with Vitest.
- [ ] Write a unit test `recursionGuard_allowsWithinLimit` that constructs a mock LangGraph execution context with recursion depth 4 (below the configured `MAX_RECURSION_DEPTH = 25`) and asserts `checkRecursionDepth(ctx)` returns `{ allowed: true }`.
- [ ] Write a unit test `recursionGuard_blocksAtLimit` that sets depth to 25 and asserts `checkRecursionDepth(ctx)` returns `{ allowed: false, reason: 'MAX_RECURSION_DEPTH_EXCEEDED' }`.
- [ ] Write a unit test `recursionGuard_emitsWarningAt80Pct` that sets depth to 20 (80% of limit) and asserts a `RECURSION_DEPTH_WARNING` event is emitted with `{ depth: 20, limit: 25 }`.
- [ ] Write a unit test `flatIterativeAdapter_producesEquivalentOutput` that defines a simple recursive LangGraph subgraph, runs it both recursively and through the `FlatIterativeAdapter`, and asserts both produce identical final state.
- [ ] Write a unit test `heapSnapshot_staysBelow200MBFor50NodeGraph` using a mocked 50-node graph expansion and asserting that the `process.memoryUsage().heapUsed` delta during execution is less than 200 MB (use `--expose-gc` + forced GC between measurements).
- [ ] Write an integration test `orchestrationGraph_trimsStateCheckpointsAboveDepth15` verifying that when recursion depth > 15, intermediate LangGraph state checkpoints older than 5 steps are pruned from memory (only the last 5 + initial are retained).

## 2. Task Implementation
- [ ] Create `src/orchestrator/recursionGuard.ts` exporting:
  - `checkRecursionDepth(ctx: LangGraphContext): RecursionCheckResult` — reads `ctx.metadata.recursionDepth` and compares against `MAX_RECURSION_DEPTH`.
  - Emits `RECURSION_DEPTH_WARNING` on the orchestrator event bus when depth ≥ 80% of max.
  - Returns `{ allowed: false, reason: 'MAX_RECURSION_DEPTH_EXCEEDED' }` at or above max.
- [ ] Add `MAX_RECURSION_DEPTH = 25` to `src/config/orchestratorConfig.ts`.
- [ ] Create `src/orchestrator/flatIterativeAdapter.ts` exporting `runGraphIteratively(graph: CompiledLangGraph, initialState: GraphState): Promise<GraphState>`:
  - Maintains an explicit stack (array) instead of relying on JS call-stack recursion.
  - Processes one LangGraph node per iteration of a `while` loop.
  - Pruning strategy: retain only the last `CHECKPOINT_WINDOW = 5` intermediate checkpoints in memory; persist older checkpoints to `state.sqlite` for potential rewind use.
- [ ] Integrate `checkRecursionDepth` into `OrchestrationGraph` at each node transition:
  - If `allowed: false`, emit `RECURSION_LIMIT_REACHED`, call `orchestrator.pause()`, and notify the `HumanInTheLoopManager`.
  - If warning threshold crossed, log the warning and emit the event (continue execution).
- [ ] Expose `MAX_RECURSION_DEPTH` and current depth as an MCP-readable state field in `OrchestratorServer` (`src/extension/orchestratorServer.ts`) so external tools can monitor it.

## 3. Code Review
- [ ] Confirm `flatIterativeAdapter` does not use `async` recursion (no `await runGraphIteratively(...)` within itself); iteration must be strictly loop-based.
- [ ] Verify checkpoint pruning in `flatIterativeAdapter` writes evicted checkpoints to SQLite **before** removing them from memory (no data loss on eviction).
- [ ] Ensure `checkRecursionDepth` derives depth from `ctx.metadata` (immutable per-invocation context), not from a mutable global counter that could drift under concurrent executions.
- [ ] Confirm `MAX_RECURSION_DEPTH` is loaded from config and the config value is validated on startup (must be a positive integer between 5 and 100).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm vitest run src/orchestrator/__tests__/recursionGuard.test.ts` and confirm all tests pass.
- [ ] Run `pnpm vitest run --reporter=verbose` for the full suite and verify no regressions.

## 5. Update Documentation
- [ ] Update `src/orchestrator/orchestrator.agent.md` with a "Recursion Depth Management" section documenting `MAX_RECURSION_DEPTH`, the warning threshold, the flat iterative adapter, and the checkpoint pruning window.
- [ ] Update `docs/architecture/langgraph-execution.md` with a Mermaid diagram contrasting recursive vs. iterative graph execution and the checkpoint retention policy.
- [ ] Update `CHANGELOG.md`: `feat(orchestrator): LangGraph recursion depth guard and flat iterative adapter for Node.js memory safety [9_ROADMAP-RISK-401]`.

## 6. Automated Verification
- [ ] Run `pnpm vitest run --reporter=json --outputFile=test-results/recursion-guard.json` and assert exit code is `0`.
- [ ] Execute `node scripts/verify_test_results.js test-results/recursion-guard.json` and confirm all tests show `status: "passed"`.
