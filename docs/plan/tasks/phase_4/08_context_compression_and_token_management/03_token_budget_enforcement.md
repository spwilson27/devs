# Task: Implement Token Budget Enforcement Per Task (Sub-Epic: 08_Context_Compression_and_Token_Management)

## Covered Requirements
- [1_PRD-REQ-REL-006], [1_PRD-REQ-SYS-001], [1_PRD-REQ-CON-004]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/compression/__tests__/token-budget-enforcer.test.ts`.
- [ ] Write a unit test asserting that `TokenBudgetEnforcer` constructed with `maxTokensPerTask: 200_000` allows task execution to proceed when total tokens consumed by the task so far is below the limit.
- [ ] Write a unit test asserting that when tokens consumed reaches the hard limit (200k), `TokenBudgetEnforcer.check()` throws a `TokenBudgetExceededError` with the fields: `taskId: string`, `tokenLimit: number`, `tokensConsumed: number`.
- [ ] Write a unit test asserting that calling `TokenBudgetEnforcer.record(n)` accumulates token counts correctly across multiple calls.
- [ ] Write a unit test asserting that `TokenBudgetEnforcer.reset()` sets the consumed counter back to 0 (called at the start of each new task).
- [ ] Write a unit test asserting that `maxTokensPerTask` is configurable and that the default value of 200_000 is used when not specified.
- [ ] Write an integration test that wires `TokenBudgetEnforcer` into a mock task execution loop and verifies the loop terminates with `TokenBudgetExceededError` when the simulated token stream exceeds 200k tokens.

## 2. Task Implementation
- [ ] Create `packages/memory/src/compression/token-budget-enforcer.ts`.
- [ ] Define and export `TokenBudgetExceededError`:
  ```typescript
  export class TokenBudgetExceededError extends Error {
    constructor(
      public readonly taskId: string,
      public readonly tokenLimit: number,
      public readonly tokensConsumed: number,
    ) {
      super(`Task ${taskId} exceeded token budget: ${tokensConsumed} / ${tokenLimit}`);
      this.name = 'TokenBudgetExceededError';
    }
  }
  ```
- [ ] Implement the `TokenBudgetEnforcer` class:
  - Constructor accepts `taskId: string` and `options?: { maxTokensPerTask?: number }` (default `200_000`).
  - Private field `tokensConsumed: number = 0`.
  - `record(tokens: number): void` — adds `tokens` to `tokensConsumed`.
  - `check(): void` — if `tokensConsumed >= maxTokensPerTask`, throws `TokenBudgetExceededError`.
  - `reset(): void` — resets `tokensConsumed` to 0.
  - `getConsumed(): number` — returns current `tokensConsumed`.
  - `getLimit(): number` — returns `maxTokensPerTask`.
- [ ] Integrate `TokenBudgetEnforcer` into the task execution orchestrator (`packages/orchestrator/src/task-runner.ts`): call `enforcer.record(turn.tokenCount)` after each turn, then `enforcer.check()` before proceeding to the next turn. Catch `TokenBudgetExceededError` and surface it as a task failure with appropriate status in the SQLite `tasks` table.
- [ ] Export `TokenBudgetEnforcer` and `TokenBudgetExceededError` from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Confirm `maxTokensPerTask` default (200k) matches the value specified in `[1_PRD-REQ-REL-006]`.
- [ ] Confirm the orchestrator integration catches `TokenBudgetExceededError` and records the failure in persistent storage (SQLite) before re-throwing or halting the task loop — no silent swallowing.
- [ ] Confirm `reset()` is called at task start (before the first turn), not at task end.
- [ ] Confirm `TokenBudgetExceededError` exposes all three diagnostic fields and that the message is human-readable.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test --testPathPattern="token-budget-enforcer"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/orchestrator test --testPathPattern="task-runner"` and confirm the integration tests pass.

## 5. Update Documentation
- [ ] Add a `## Token Budget Enforcement` section to `packages/memory/README.md` documenting the default limit (200k tokens/task), how to override it, and the error thrown when exceeded.
- [ ] Add a callout to `docs/architecture/context-management.md` explaining that budget enforcement runs at the task level and is distinct from the global compression threshold.

## 6. Automated Verification
- [ ] CI step `pnpm --filter @devs/memory test && pnpm --filter @devs/orchestrator test` exits with code 0.
- [ ] Verify export: `node -e "const m = require('./packages/memory/dist'); console.assert(typeof m.TokenBudgetEnforcer === 'function'); console.assert(typeof m.TokenBudgetExceededError === 'function')"`.
