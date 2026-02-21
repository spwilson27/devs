# Task: Integrate Sliding Relevance Window into the Orchestration Loop (Sub-Epic: 07_Sliding_Relevance_Window)

## Covered Requirements
- [3_MCP-REQ-SYS-001], [REQ-SYS-001], [3_MCP-TAS-024], [3_MCP-TAS-047], [8_RISKS-REQ-012]

## 1. Initial Test Written

- [ ] Create `packages/core/src/orchestrator/__tests__/sliding-window-integration.test.ts`.
- [ ] Write a test: given an `OrchestratorContext` with a mock `WindowComposer`, `ContextPruner`, and `ToolOutputPruner`, the `applyContextManagement()` method calls `WindowComposer.compose()` on every turn.
- [ ] Write a test: when `ContextPruner.shouldPrune(currentTokenCount, budget)` returns `true`, `applyContextManagement()` calls `ContextPruner.prune()` and replaces `context.turns` with the pruned summary as a single synthetic turn.
- [ ] Write a test: when `shouldPrune` returns `false`, `ContextPruner.prune()` is NOT called.
- [ ] Write a test: for each tool output in `context.pendingToolOutputs`, if `ToolOutputPruner.shouldTruncate(entry)` returns `true`, `applyContextManagement()` first calls `persistRaw(entry, db)` then calls `truncate(entry)` and replaces the in-context entry with the truncated version.
- [ ] Write a test: `applyContextManagement()` returns an `AppliedContextResult` with `windowUsedTokens: number`, `prunedOccurred: boolean`, and `truncatedOutputCount: number`.
- [ ] Write an integration test: run `applyContextManagement()` with 20 synthetic `AgentTurn` objects totalling > 90% of `800_000` token budget; assert `prunedOccurred === true` and `windowUsedTokens < budget.totalBudget` after the call.
- [ ] Write a test: `applyContextManagement()` is idempotent — calling it twice on an already-pruned context does not trigger a second pruning.

## 2. Task Implementation

- [ ] Create `packages/core/src/orchestrator/context-management.ts`. Export:
  - `AppliedContextResult = { windowUsedTokens: number; prunedOccurred: boolean; truncatedOutputCount: number }`
  - `async function applyContextManagement(context: OrchestratorContext, deps: ContextManagementDeps): Promise<AppliedContextResult>`:
    1. Compute `currentTokenCount` by summing `countTokens(turn.content)` for all `context.turns`.
    2. Call `deps.composer.compose(context.goal, context.map, context.envelopes)` to get the active `ComposedWindow`.
    3. If `deps.pruner.shouldPrune(currentTokenCount, context.budget)`: call `await deps.pruner.prune(context.turns, context.plan, context.tas, context.currentObservation)`, replace `context.turns` with a single synthetic `AgentTurn` whose content is `prunedContext.summary`, set `prunedOccurred = true`.
    4. For each entry in `context.pendingToolOutputs`: if `deps.toolOutputPruner.shouldTruncate(entry)`, call `await deps.toolOutputPruner.persistRaw(entry, deps.stateRepository)`, then replace entry with `deps.toolOutputPruner.truncate(entry)`, increment `truncatedOutputCount`.
    5. Recompute `windowUsedTokens` from the final composed window.
    6. Return `AppliedContextResult`.
- [ ] Define `ContextManagementDeps = { composer: WindowComposer; pruner: ContextPruner; toolOutputPruner: ToolOutputPruner; stateRepository: StateRepository }`.
- [ ] Define `OrchestratorContext = { turns: AgentTurn[]; goal: string; map: string; plan: string; tas: string; currentObservation: string; envelopes: SaopEnvelope[]; pendingToolOutputs: ToolOutputEntry[]; budget: WindowBudget }`.
- [ ] Wire `applyContextManagement` into the orchestrator's main turn loop in `packages/core/src/orchestrator/orchestrator.ts`: call it at the START of each agent turn, before constructing the prompt for the model.
- [ ] Expose `applyContextManagement` in the `@devs/core` package barrel (`packages/core/src/index.ts`) for use by CLI and VSCode extension diagnostic tools.

## 3. Code Review

- [ ] Verify the call order within `applyContextManagement` is strictly: (1) count tokens, (2) compose window, (3) prune if needed, (4) truncate tool outputs, (5) recompute final token count. This order is non-negotiable per [3_MCP-TAS-047].
- [ ] Confirm `persistRaw` is always called BEFORE `truncate` within the tool output loop — a failed `persistRaw` must abort truncation for that entry and log a warning.
- [ ] Verify `context` object mutations are minimised: prefer returning a new `OrchestratorContext` copy rather than mutating in place, unless performance profiling proves mutation is required.
- [ ] Ensure `applyContextManagement` is fully mockable via its `deps` parameter — no direct imports of concrete implementations inside the function body.
- [ ] Verify the orchestrator's `orchestrator.ts` calls `applyContextManagement` inside the turn loop and NOT outside (so it applies on every turn, not once at startup).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="sliding-window-integration"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] Run `pnpm test` (workspace-wide) and confirm no regressions in existing orchestrator tests.

## 5. Update Documentation

- [ ] Update `packages/core/src/orchestrator/orchestrator.agent.md` (or create it if absent) with a section "Context Management" describing: when `applyContextManagement` is called in the turn loop, the dependency injection pattern (`ContextManagementDeps`), the meaning of `AppliedContextResult` fields, and the requirement that pruning must complete before the model prompt is built.
- [ ] Add a top-level entry in `docs/architecture.md` (or equivalent) under "Phase 4 — Intelligence" linking to the three sub-module `.agent.md` files created in tasks 01–04 of this sub-epic.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern="context-management"` and confirm branch coverage ≥ 85% for `context-management.ts`.
- [ ] Run `pnpm tsc --noEmit` at workspace root and confirm exit code `0` with no errors across all packages.
- [ ] Run the integration test (non-skipped) using `pnpm --filter @devs/core test -- --testPathPattern="sliding-window-integration"` and confirm `prunedOccurred` is `true` in the high-token-count scenario and `windowUsedTokens < 800_000` after pruning.
