# Task: Integrate Binary Gate with TDD Execution Engine and Agent Gatekeeping (Sub-Epic: 07_TAS)

## Covered Requirements
- [TAS-041], [TAS-079]

## 1. Initial Test Written
- [ ] In `packages/core/src/execution/__tests__/tdd-gate.integration.test.ts` write integration tests that:
  - Mock the sandbox runner to return exit code 0 and assert the `TestNode`/`VerificationNode` advances the DAG (use a small in-memory DAG fixture).
  - Mock the sandbox runner to return exit code 1 and assert the DAG does not advance and a `GATE_FAILED` event is emitted/logged.
  - Mock the sandbox runner to return a `qualityReport` and assert that the engine routes the result to the `QUALITY` processing subflow (verify corresponding event emitted).
  - Verify that only an agent instance produced by `AgentFactory.create('developer')` is allowed to perform the `CommitNode` operation; attempts by an agent without `developer` permissions (e.g., researcher) must be rejected with a `PermissionDeniedError`.

## 2. Task Implementation
- [ ] Implement `packages/core/src/execution/tdd-executor.ts` (or modify existing executor) to:
  - After a sandbox run, call `evaluate(exitCode, { qualityReport })` from `packages/core/src/sandbox/binary-gate`.
  - Use the returned `GateResult.status` to decide: `GREEN` -> advance to `CommitNode`; `RED` -> emit `GATE_FAILED` and remain or retry; `REGRESSION` -> trigger regression subflow; `QUALITY` -> route to quality-checks.
  - Before performing any `CommitNode` actions, verify the caller agent's `allowedTools` via `ToolRegistry.canRoleUse('developer', 'git:commit')` (or equivalent) and throw `PermissionDeniedError` if not allowed.
  - Add file-level comments `// REQ: TAS-041` and `// REQ: TAS-079`.

## 3. Code Review
- [ ] Confirm the executor treats `binary-gate.evaluate()` results as authoritative and that there are no race conditions between gate evaluation and commit actions.
- [ ] Verify the executor checks `ToolRegistry` permissions atomically prior to commit and that commits are performed as atomic operations (single commit per task with Task ID in the commit message).
- [ ] Ensure `// REQ: TAS-041` and `// REQ: TAS-079` annotations are present.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="tdd-gate"` and ensure integration tests pass.
- [ ] Run the full test suite.

## 5. Update Documentation
- [ ] Update `docs/execution/tdd-engine.md` describing how the binary gate controls task progression and how agent permissions gate commit operations.
- [ ] Add examples showing the exact commit message format (include Task ID and brief description) used by `CommitNode`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --coverage` and assert the new executor integration tests are covered.
- [ ] Run `grep -n "REQ: TAS-041" packages/core/src/execution/tdd-executor.ts` and `grep -n "REQ: TAS-079" packages/core/src/execution/tdd-executor.ts` and assert exit code 0.
- [ ] Run `pnpm --filter @devs/core build` to ensure types compile.
