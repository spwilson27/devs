# Task: Integrate TDD Gate into DeveloperAgent turn logic (Sub-Epic: 03_TAS)

## Covered Requirements
- [TAS-004]

## 1. Initial Test Written
- [ ] Create integration tests at tests/agents/developeragent.tddgate.spec.ts that mock TestNode and VerificationNode. Tests to write first (will fail before implementation):
  - Test A: "DeveloperAgent refuses to perform code edits if TestNode.enforceRedPhase returns allowed:false"
    - Arrange: Mock TestNode.enforceRedPhase() => {allowed:false, reason:'no_failing_test'}
    - Act: run DeveloperAgent.performTurn(sandbox)
    - Assert: expect the agent to emit action 'request_create_failing_test' and NOT call CodeNode.modifyFiles.
  - Test B: "DeveloperAgent performs CodeNode then verifies via VerificationNode and only commits on pass"
    - Arrange: Mock TestNode.enforceRedPhase() => {allowed:true}; Mock VerificationNode.runTests() => {status:'passed'}
    - Act: run DeveloperAgent.performTurn(sandbox)
    - Assert: expect CodeNode.modifyFiles called, CommitNode.commit called, and Agent returns status 'task_completed'.

## 2. Task Implementation
- [ ] Update src/agents/DeveloperAgent.ts (or the repo's agent entrypoint) to implement strict TDD gating:
  1. On each performTurn(sandbox, taskContext) call, first call TestNode.enforceRedPhase(sandbox).
  2. If allowed === false, emit an action instructing the agent to produce a failing test and stop further processing for this turn.
  3. If allowed === true, call CodeNode to prepare code edits (but do NOT persist changes to Git).
  4. After CodeNode changes, call VerificationNode.runTests(sandbox); if status==='passed' then call CommitNode.commit(taskId, message) (CommitNode is implemented in separate TAS-039 tasks).
  5. Ensure each step is wrapped in an ephemeral transaction/context such that file-system changes are staged and only committed by CommitNode.
  6. Tag all emitted events and commits with REQ:[TAS-004].

## 3. Code Review
- [ ] Validate the agent flow is linear and auditable (logs for each step), avoid long-running in-memory state between turns, and check for defensive error handling (timeouts, retries capped). Ensure developeragent unit/integration tests are present and reference [TAS-004].

## 4. Run Automated Tests to Verify
- [ ] Run integration tests: `pnpm vitest tests/agents/developeragent.tddgate.spec.ts --run --reporter=json`. Ensure failing tests drive the implementation cycle and that the gated behavior is enforced.

## 5. Update Documentation
- [ ] Update docs/agents/developer_agent.md describing the gating flow: TestNode -> CodeNode -> VerificationNode -> CommitNode and include a diagram (Mermaid) showing the red->green->commit transition with [TAS-004] references.

## 6. Automated Verification
- [ ] Automated verification script: run the mocked integration spec and assert that when TestNode denies progression no code-mod steps are taken and that when TestNode allows, CommitNode is invoked only after VerificationNode reports 'passed'. Exit code must be 0 for success.
