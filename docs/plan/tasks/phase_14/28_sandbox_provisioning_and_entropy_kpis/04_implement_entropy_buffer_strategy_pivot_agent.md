# Task: Implement Entropy Buffer Allocation for StrategyPivotAgent (Sub-Epic: 28_Sandbox Provisioning and Entropy KPIs)

## Covered Requirements
- [9_ROADMAP-REQ-046]

## 1. Initial Test Written
- [ ] In `src/orchestrator/__tests__/entropy-buffer.test.ts`, write unit tests for an `EntropyBuffer` class:
  - `describe('EntropyBuffer')`:
    - Test that constructing `EntropyBuffer({ totalTokenBudget: 1000, bufferFraction: 0.2 })` sets `reservedTokens = 200` and `implementationTokens = 800`.
    - Test that constructing with `bufferFraction` outside `[0.05, 0.5]` throws an `InvalidBufferFractionError`.
    - Test `canConsumeImplementation(tokens: number): boolean` returns `true` when tokens ≤ remaining implementation budget and `false` when it would exceed it.
    - Test `consumeImplementation(tokens: number): void` decrements `remainingImplementationTokens` by the given amount.
    - Test `consumeBuffer(tokens: number): void` decrements `remainingBufferTokens` and records the consumption reason.
    - Test `canConsumeBuffer(tokens: number): boolean` returns `true`/`false` based on remaining buffer.
    - Test `getUsageReport()` returns `{ totalBudget, reservedTokens, implementationTokens, remainingImplementationTokens, remainingBufferTokens, bufferConsumptionLog }`.
  - `describe('StrategyPivotAgent integration')`:
    - Mock a `StrategyPivotAgent` that calls `buffer.consumeBuffer(estimatedTokens, 'pivot_attempt')`.
    - Assert that after 5 pivot attempts the buffer is eventually exhausted and `canConsumeBuffer()` returns `false`.
    - Assert that when the buffer is exhausted, the orchestrator's `pause()` is called with reason `'entropy_buffer_exhausted'`.

## 2. Task Implementation
- [ ] Create `src/orchestrator/entropy-buffer.ts`:
  - Export `InvalidBufferFractionError extends Error`.
  - Export interface `BufferConsumptionEntry { reason: string; tokens: number; timestamp: Date; }`.
  - Export interface `BufferUsageReport { totalBudget: number; reservedTokens: number; implementationTokens: number; remainingImplementationTokens: number; remainingBufferTokens: number; bufferConsumptionLog: BufferConsumptionEntry[]; }`.
  - Implement `EntropyBuffer`:
    - Constructor: `({ totalTokenBudget: number; bufferFraction: number })` — validate fraction in `[0.05, 0.5]`, compute `reservedTokens = Math.floor(totalTokenBudget * bufferFraction)`, `implementationTokens = totalTokenBudget - reservedTokens`.
    - Maintain `remainingImplementationTokens` and `remainingBufferTokens` as mutable fields.
    - Maintain `bufferConsumptionLog: BufferConsumptionEntry[]`.
    - Implement `canConsumeImplementation(tokens: number): boolean`.
    - Implement `consumeImplementation(tokens: number): void` — throws `InsufficientBudgetError` if not enough remaining.
    - Implement `canConsumeBuffer(tokens: number): boolean`.
    - Implement `consumeBuffer(tokens: number, reason: string): void` — pushes to `bufferConsumptionLog`; throws `InsufficientBudgetError` if exhausted.
    - Implement `getUsageReport(): BufferUsageReport`.
- [ ] Create `src/orchestrator/strategy-pivot-agent.ts` (or extend existing if present):
  - Accept an `EntropyBuffer` and an orchestrator reference in the constructor.
  - Implement `async pivot(taskId: string, estimatedTokens: number): Promise<void>`:
    - Check `buffer.canConsumeBuffer(estimatedTokens)`; if false, call `orchestrator.pause('entropy_buffer_exhausted')` and return.
    - Consume the buffer via `buffer.consumeBuffer(estimatedTokens, \`pivot_for_task_\${taskId}\`)`.
    - Execute the pivot logic (re-prompt the LLM with a "first principles" instruction).
- [ ] Wire the `EntropyBuffer` into the phase/epic orchestration layer so the 20% buffer is initialized once per phase with the phase's total token budget.

## 3. Code Review
- [ ] Verify `bufferFraction` validation produces a clear, actionable error message.
- [ ] Confirm `consumeImplementation` and `consumeBuffer` are mutually exclusive budget pools (consuming from one does NOT affect the other).
- [ ] Ensure `bufferConsumptionLog` entries include `timestamp` for auditability.
- [ ] Confirm the `StrategyPivotAgent.pivot()` never silently swallows `InsufficientBudgetError` — it must pause the orchestrator.
- [ ] Verify the requirement comment `// [9_ROADMAP-REQ-046]` appears above the `EntropyBuffer` constructor and `pivot()` method.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/orchestrator/__tests__/entropy-buffer.test.ts` — all unit tests pass with 0 failures.
- [ ] Run `pnpm tsc --noEmit` — zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/orchestrator/entropy-buffer.agent.md` documenting: the 20% default fraction rationale, `BufferUsageReport` shape, integration with `StrategyPivotAgent`, and what happens when the buffer is exhausted.
- [ ] Update `docs/architecture/orchestrator.md` with a section "Entropy Buffer" covering the allocation strategy and the pivot-agent integration.
- [ ] Update `docs/architecture/kpis.md` with a section "Entropy Buffer KPI" showing how to query `bufferConsumptionLog` for post-phase analysis.

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/orchestrator` and confirm coverage ≥ 90% for `entropy-buffer.ts` and `strategy-pivot-agent.ts`.
- [ ] Run `pnpm run validate-all` and confirm exit code 0.
- [ ] Confirm that the `getUsageReport()` output for a fresh buffer with `totalTokenBudget: 1000, bufferFraction: 0.2` exactly matches `{ totalBudget: 1000, reservedTokens: 200, implementationTokens: 800, remainingImplementationTokens: 800, remainingBufferTokens: 200 }` via an automated assertion in the test suite.
