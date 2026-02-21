# Task: Implement Context Drift Mitigation via Priority-Pinned Context Pruning Window (Sub-Epic: 17_Infrastructure Risk Mitigation)

## Covered Requirements
- [3_MCP-RISK-303]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/__tests__/contextPruner.test.ts` with Vitest.
- [ ] Write a unit test `pruneWindow_alwaysRetainsTASAndRequirements` that builds a mock message history of 50 messages (mix of tool calls, agent thoughts, and summaries), calls the pruner, and asserts that the first message whose `role` is `TAS_BLUEPRINT` and the first message whose `role` is `REQUIREMENTS_SUMMARY` are **always present** in the output regardless of token budget.
- [ ] Write a unit test `pruneWindow_dropsLowPriorityMessagesFirst` that verifies agent reasoning turns and intermediate tool observations (tagged `priority: LOW`) are evicted before TAS/requirements messages when the token budget is tight.
- [ ] Write a unit test `pruneWindow_respectsTokenBudget` confirming the total estimated token count of the output window never exceeds the configured `maxTokens` (200 000 by default).
- [ ] Write a unit test `pruneWindow_summaryFallback` asserting that when a full TAS cannot fit within the budget, a pre-computed `TAS_SUMMARY` message (tagged `priority: CRITICAL`) is substituted rather than omitting TAS entirely.
- [ ] Write an integration test `orchestratorNode_reinjectsTASEvery10Turns` using a mocked LangGraph harness that runs a node 12 times and confirms TAS/PRD summary messages are re-injected at turn 10 and 20.

## 2. Task Implementation
- [ ] Create `src/orchestrator/contextPruner.ts` exporting `pruneContextWindow(messages: ContextMessage[], budget: TokenBudget): ContextMessage[]`.
  - Define `ContextMessage` type with `{ role: MessageRole, content: string, priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW', estimatedTokens: number }`.
  - Define `MessageRole` enum including `TAS_BLUEPRINT`, `REQUIREMENTS_SUMMARY`, `TAS_SUMMARY`, `AGENT_THOUGHT`, `TOOL_OBSERVATION`, `TOOL_RESULT`.
  - Implement priority-order eviction: evict `LOW` → `NORMAL` → `HIGH`; never evict `CRITICAL`.
  - When full TAS would overflow, substitute `TAS_SUMMARY` (pre-stored in `StateManager`).
- [ ] Create `src/orchestrator/contextInjector.ts` exporting `buildBaseContext(stateManager: StateManager): ContextMessage[]` that loads TAS and top-level requirements, wraps them as `CRITICAL` priority messages, and returns them ready to prepend to any agent turn.
- [ ] Integrate `contextPruner` into `OrchestrationGraph` (`src/orchestrator/orchestrationGraph.ts`):
  - Before every agent node invocation, call `pruneContextWindow` with the current message list and `maxTokens = 200_000`.
  - Every 10 turns within a single node execution, call `contextInjector.buildBaseContext` and prepend results to the pruned window.
- [ ] Add a configurable constant `CONTEXT_REINJECTION_INTERVAL = 10` to `src/config/orchestratorConfig.ts`.

## 3. Code Review
- [ ] Confirm `pruneContextWindow` is a pure function; token counting should use a shared utility (e.g., `src/utils/tokenCounter.ts`) not inline estimates.
- [ ] Verify that `CRITICAL` priority messages can never be evicted under any code path (no conditional logic that removes them).
- [ ] Ensure `contextInjector` caches the TAS blueprint between turns and only reloads from `StateManager` if the TAS version hash has changed.
- [ ] Confirm the re-injection interval is driven by the config constant (not a magic number in graph code).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm vitest run src/orchestrator/__tests__/contextPruner.test.ts` and confirm all tests pass.
- [ ] Run `pnpm vitest run --reporter=verbose` for the full suite and verify no regressions.

## 5. Update Documentation
- [ ] Create or update `src/orchestrator/orchestrator.agent.md` with a section "Context Drift Mitigation" describing priority levels, eviction order, and the 10-turn re-injection strategy.
- [ ] Add a Mermaid sequence diagram in `docs/architecture/context-management.md` showing the pruning flow and TAS re-injection cadence.
- [ ] Update `CHANGELOG.md`: `feat(orchestrator): priority-pinned context pruning to prevent TAS/requirement drift [3_MCP-RISK-303]`.

## 6. Automated Verification
- [ ] Run `pnpm vitest run --reporter=json --outputFile=test-results/context-pruner.json` and assert exit code is `0`.
- [ ] Execute `node scripts/verify_test_results.js test-results/context-pruner.json` and confirm all tests show `status: "passed"`.
