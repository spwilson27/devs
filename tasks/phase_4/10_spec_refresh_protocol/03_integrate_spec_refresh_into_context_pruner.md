# Task: Integrate Spec Refresh into ContextPruner Orchestration Loop (Sub-Epic: 10_Spec_Refresh_Protocol)

## Covered Requirements
- [3_MCP-TAS-050], [8_RISKS-REQ-011], [5_SECURITY_DESIGN-REQ-SEC-SD-084], [9_ROADMAP-BLOCKER-001]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/contextPruner.specRefresh.test.ts`, write integration tests for the `ContextPruner` class wired to both `SpecRefreshTrigger` and `SpecRefreshService`:
  - **Turn 1–9**: After each call to `pruner.processTurn(messages)`, assert that the returned `ContextWindow` does NOT contain `<!-- SPEC_REFRESH_START -->`.
  - **Turn 10**: After the 10th call to `pruner.processTurn(messages)`, assert the returned `ContextWindow` DOES start with `<!-- SPEC_REFRESH_START -->` and ends with `<!-- SPEC_REFRESH_END -->`.
  - **Turn 11–19**: Assert the refresh block is NOT present (it was a one-shot injection for turn 10 only).
  - **Turn 20**: Assert the refresh block IS present again.
  - **Old refresh block replacement**: Seed the `ContextWindow` with a stale `<!-- SPEC_REFRESH_START -->...<!-- SPEC_REFRESH_END -->` block from a prior turn. After turn 20, assert the old block was removed before the new one was prepended (i.e., there is exactly ONE `<!-- SPEC_REFRESH_START -->` in the window).
  - **Intent preservation benchmark** (covers `9_ROADMAP-BLOCKER-001`): Construct a context of 100 synthetic turns where each message introduces a rule (e.g., "Use PostgreSQL, not SQLite"). After processing all 100 turns through `ContextPruner`, query the final context for that rule. Assert the rule is present.

## 2. Task Implementation
- [ ] Modify `packages/memory/src/contextPruner.ts` to accept `SpecRefreshTrigger` and `SpecRefreshService` as constructor dependencies:
  ```ts
  constructor(
    private readonly db: BetterSqlite3.Database,
    private readonly refreshTrigger: SpecRefreshTrigger,
    private readonly refreshService: SpecRefreshService,
    private readonly options: ContextPrunerOptions = {}
  )
  ```
- [ ] In `ContextPruner.processTurn(messages: ContextMessage[]): Promise<IContextWindow>`:
  1. Call `this.refreshTrigger.incrementTurn()`.
  2. Strip any existing `<!-- SPEC_REFRESH_START -->...<!-- SPEC_REFRESH_END -->` block from the current context window using a regex: `/<!--\s*SPEC_REFRESH_START\s*-->[\s\S]*?<!--\s*SPEC_REFRESH_END\s*-->/g`.
  3. If `this.refreshTrigger.shouldRefresh()`, call `await this.refreshService.injectIntoContext(contextWindow, this.refreshTrigger.getTurnCount())`.
  4. Return the final `contextWindow`.
- [ ] Ensure `ContextPrunerOptions` type (in `packages/memory/src/types.ts`) includes:
  ```ts
  export interface ContextPrunerOptions {
    refreshInterval?: number; // default 10
    maxTokens?: number;       // default 800_000
  }
  ```
- [ ] Add a factory function `createContextPruner(db, tasPath, prdPath, options?)` in `packages/memory/src/index.ts` that wires all three classes together as a convenience export.

## 3. Code Review
- [ ] Verify that old refresh blocks are always stripped before new ones are injected — no duplicate `<!-- SPEC_REFRESH_START -->` blocks should ever appear.
- [ ] Confirm `processTurn()` is the single integration point; `SpecRefreshTrigger` and `SpecRefreshService` must not be called from any other method in `ContextPruner`.
- [ ] Confirm the `createContextPruner` factory keeps the constructor signature pure (no factory logic inside the class itself).
- [ ] Verify the 100-turn intent-preservation benchmark test uses deterministic synthetic data (no LLM calls) so it runs reliably in CI.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=contextPruner.specRefresh` and confirm all tests pass.
- [ ] Run the full memory package suite: `pnpm --filter @devs/memory test` — zero failures.
- [ ] Confirm coverage for `contextPruner.ts` remains ≥ 90%: `pnpm --filter @devs/memory test -- --coverage`.

## 5. Update Documentation
- [ ] Update `packages/memory/README.md` to document the `createContextPruner` factory, its parameters, and a minimal usage example showing how the refresh fires at turn 10.
- [ ] Update `docs/architecture/context-management.md` to add a sequence diagram (Mermaid) showing the turn loop: `processTurn → incrementTurn → strip old block → shouldRefresh? → injectIntoContext`.
- [ ] Add an entry in `docs/agent-memory/spec-refresh.md` describing the "intent preservation" guarantee and referencing the 100-turn benchmark test as the validation method for `9_ROADMAP-BLOCKER-001`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory build` — zero TypeScript errors.
- [ ] Run the 100-turn intent-preservation test explicitly: `pnpm --filter @devs/memory test -- --testNamePattern="intent preservation benchmark"` — exits 0.
- [ ] Run `grep -c "SPEC_REFRESH_START" <(node -e "...")` smoke test that produces exactly one occurrence in a simulated 20-turn context window. Document the exact command in `packages/memory/scripts/smoke-spec-refresh.sh` and run it.
