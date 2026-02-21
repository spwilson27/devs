# Task: Implement Context Refresh Logic After 5 Turns (Sub-Epic: 02_SAOP Protocol Implementation)

## Covered Requirements
- [3_MCP-TAS-089], [3_MCP-TAS-088], [TAS-035]

## 1. Initial Test Written
- [ ] In `packages/core/src/protocol/__tests__/context-refresher.test.ts`, write unit tests that:
  - Test `ContextRefresher` instantiation with `new ContextRefresher({ threshold: 5, summaryProvider: mockProvider })` and assert `turnsInCurrentNode` starts at `0`.
  - Test `ContextRefresher.onTurn(turnIndex: number): Promise<RefreshResult>` returns `{ refreshed: false }` for turns 1–4 (i.e., `turnsInCurrentNode < threshold`).
  - Test `ContextRefresher.onTurn` returns `{ refreshed: true, injectedSummary: '<summary string>' }` exactly on turn 5 (the 5th call in the same node).
  - Test that after a refresh fires, the internal `turnsInCurrentNode` counter resets to `0`, so the next refresh fires again after 5 more turns.
  - Test that the `summaryProvider` mock is called exactly once per refresh event and not on non-refresh turns.
  - Test `ContextRefresher.resetNode()` resets `turnsInCurrentNode` to `0` without triggering a refresh.
  - Test that if `summaryProvider` throws, `onTurn` propagates the error (does not silently swallow it).
  - Test `ContextRefresher` with `threshold: 1` and confirm a refresh fires on every single turn.
  - Test that `injectedSummary` returned on refresh contains both the TAS summary and PRD summary concatenated (using mock provider that returns distinct strings for each).

- [ ] In `packages/core/src/protocol/__tests__/orchestrator-context-injector.test.ts`, write integration tests that:
  - Test the `OrchestratorContextInjector.injectIfNeeded(envelope: SaopEnvelope, turnIndex: number): Promise<SaopEnvelope>` method.
  - Assert that for the first 4 turns, the returned envelope's `thought.reasoning` is unchanged.
  - Assert that on turn 5, the returned envelope's `thought.reasoning` is prepended with `"[CONTEXT REFRESH] <summary>"`.
  - Assert that the returned envelope is a new object (not mutated in place).
  - Assert that calling `injectIfNeeded` 10 times results in exactly 2 refresh injections (at turns 5 and 10).

## 2. Task Implementation
- [ ] Create `packages/core/src/protocol/context-refresher.ts`:
  - Export interface `SummaryProvider` with method `getSummary(): Promise<{ tasSummary: string; prdSummary: string }>`.
  - Export interface `RefreshResult` with fields `refreshed: boolean` and optional `injectedSummary?: string`.
  - Export interface `ContextRefresherOptions` with fields `threshold: number` (default `5`) and `summaryProvider: SummaryProvider`.
  - Export class `ContextRefresher`:
    - Constructor: `constructor(private options: ContextRefresherOptions)` initializing `private turnsInCurrentNode = 0`.
    - `async onTurn(turnIndex: number): Promise<RefreshResult>`:
      1. Increment `this.turnsInCurrentNode`.
      2. If `this.turnsInCurrentNode < this.options.threshold`, return `{ refreshed: false }`.
      3. Call `this.options.summaryProvider.getSummary()`.
      4. Reset `this.turnsInCurrentNode = 0`.
      5. Return `{ refreshed: true, injectedSummary: '[CONTEXT REFRESH]\n## TAS Summary\n${tasSummary}\n\n## PRD Summary\n${prdSummary}' }`.
    - `resetNode(): void` — sets `this.turnsInCurrentNode = 0`.
- [ ] Create `packages/core/src/protocol/orchestrator-context-injector.ts`:
  - Export class `OrchestratorContextInjector`:
    - Constructor: `constructor(private refresher: ContextRefresher)`.
    - `async injectIfNeeded(envelope: SaopEnvelope, turnIndex: number): Promise<SaopEnvelope>`:
      1. Call `this.refresher.onTurn(turnIndex)`.
      2. If `result.refreshed === false`, return `envelope` unchanged.
      3. Return `{ ...envelope, thought: { ...envelope.thought, reasoning: \`${result.injectedSummary}\n\n${envelope.thought.reasoning}\` } }` (new object, no mutation).
- [ ] Export `ContextRefresher`, `OrchestratorContextInjector`, `SummaryProvider`, `RefreshResult`, `ContextRefresherOptions` from `packages/core/src/protocol/index.ts`.

## 3. Code Review
- [ ] Verify the `threshold` defaults to `5` in `ContextRefresherOptions` to match the specification in [3_MCP-TAS-089].
- [ ] Verify `turnsInCurrentNode` resets immediately after a refresh fires, not after the next turn.
- [ ] Verify `OrchestratorContextInjector.injectIfNeeded` never mutates the input `envelope` (always returns a new object).
- [ ] Verify the `SummaryProvider` interface is defined as an interface (not a class) to allow multiple implementations (file-based, DB-based, in-memory mock).
- [ ] Verify the injected summary string clearly labels both the TAS and PRD sections so agents can parse them deterministically.
- [ ] Verify `ContextRefresher` is not coupled to any specific MCP transport or I/O — it is pure protocol logic.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="context-refresher|orchestrator-context-injector"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript compilation errors.
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern="context-refresher"` and confirm statement coverage for `context-refresher.ts` is ≥ 95%.

## 5. Update Documentation
- [ ] Add a `## Context Refresh` section to `packages/core/src/protocol/README.md` describing:
  - The problem: reasoning drift occurs when agents lose awareness of project constraints after many turns.
  - The solution: after every 5 turns in a single orchestrator node, the TAS and PRD summaries are re-injected into the `thought.reasoning` field.
  - A Mermaid sequence diagram showing: `Orchestrator → ContextRefresher.onTurn(n) → [if n%5==0] SummaryProvider.getSummary() → OrchestratorContextInjector.injectIfNeeded(envelope)`.
  - Configuration: how to override `threshold` for testing or different agent roles.
- [ ] Update `packages/core/index.agent.md` to record: "`ContextRefresher` and `OrchestratorContextInjector` implemented per [3_MCP-TAS-089]. After every 5 turns in a node (`threshold=5`), TAS+PRD summaries are prepended to `thought.reasoning`. Counter resets after each refresh. `resetNode()` must be called when switching orchestrator nodes."

## 6. Automated Verification
- [ ] Run the following integration smoke test command and assert it exits `0`:
  ```bash
  node -e "
    const { ContextRefresher } = require('./packages/core/dist/protocol');
    const mockProvider = { getSummary: async () => ({ tasSummary: 'TAS', prdSummary: 'PRD' }) };
    const r = new ContextRefresher({ threshold: 5, summaryProvider: mockProvider });
    (async () => {
      let refreshCount = 0;
      for (let i = 1; i <= 10; i++) {
        const result = await r.onTurn(i);
        if (result.refreshed) refreshCount++;
      }
      if (refreshCount !== 2) process.exit(1);
      console.log('context_refresh_ok');
    })();
  "
  ```
  and confirm `context_refresh_ok` is printed.
- [ ] Confirm `pnpm --filter @devs/core test 2>&1 | grep -c FAIL` outputs `0`.
