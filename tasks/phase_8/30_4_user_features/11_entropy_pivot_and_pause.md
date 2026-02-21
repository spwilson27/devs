# Task: Implement StrategyPivotAgent and Entropy Pause Workflow (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-022]

## 1. Initial Test Written
- [ ] Create unit tests in `src/entropy/__tests__/pivot.test.ts`:
  - Test `StrategyPivotAgent.handle(hash, count)` when called with `count >= threshold` results in a `PivotAction` that instructs the DeveloperAgent to pause and produce an RCA request.
  - Test that the pivot logic increments a `pivotCount` and after `n` pivots triggers a human-in-the-loop pause and notification.
- [ ] Create integration test that wires `EntropyDetector` and `StrategyPivotAgent` together and simulates repeated outputs to confirm pivot actions are generated and persisted to `entropy_pivots` table.

## 2. Task Implementation
- [ ] Implement `src/entropy/strategy_pivot.ts` exporting `StrategyPivotAgent` with methods:
  - `async handle(agentId: string, hash: string, count: number)` which:
    1. Logs the pivot event in `entropy_pivots` with trace data.
    2. If `count >= pivotThreshold` then mark the current task as `paused` in `tasks` table, and enqueue an RCA job to generate a root-cause analysis report.
    3. Optionally switch DeveloperAgent strategy to a fallback mode (e.g., reduce model temperature, switch prompt to first principles) for the next attempt.
  - Implement notification hooks to alert human operators via the UI/MCP when a human-in-the-loop pause occurs.
- [ ] Provide configuration for `pivotThreshold`, `maxPivotsBeforeHITL`, and strategy overrides.

## 3. Code Review
- [ ] Ensure pivoting is logged with sufficient context (recent outputs, test outputs, stack traces) to reproduce the failure.
- [ ] Verify that marking task `paused` is atomic and includes a reason code to avoid ambiguity.
- [ ] Confirm that any auto-strategy changes are reversible and recorded in the task's audit trail.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="pivot|strategy_pivot"` and ensure tests pass.
- [ ] Run an integration smoke test that triggers a pivot and verifies the task status becomes `paused` and a notification event is emitted.

## 5. Update Documentation
- [ ] Add `docs/entropy/PIVOT.md` documenting pivot thresholds, RCA workflow, and how to configure human-in-the-loop escalation.
- [ ] Update `docs/agents/AGENT_WORKFLOWS.md` with examples of strategy overrides invoked by the pivot agent.

## 6. Automated Verification
- [ ] CI scenario that simulates repeated failing outputs, asserts pivot record creation in `entropy_pivots`, and verifies the `tasks` table shows `status='paused'` for the affected task.
- [ ] Automated check that notifications are enqueued (or sent to a stubbed notification service) when `maxPivotsBeforeHITL` is exceeded.
