# Task: Implement LangGraph WaitForApproval node and blocking gate logic (Sub-Epic: 11_Blueprint Gate Logic)

## Covered Requirements
- [9_ROADMAP-TAS-404], [9_ROADMAP-REQ-008], [9_ROADMAP-REQ-002]

## 1. Initial Test Written
- [ ] Write unit tests for a new LangGraph node `WaitForApproval` at tests/unit/test_wait_for_approval_node.py. Tests to write first:
  - test_node_blocks_until_approved: simulate a LangGraph execution that reaches WaitForApproval with a generated token; assert the execution is suspended (non-complete) until ApprovalToken.mark_approved is called, then resumes and returns the expected downstream output.
  - test_node_timeout: set a short timeout and assert the node raises a TimeoutError or returns a defined failure state when approval does not arrive.
  - test_resume_on_event: mock the internal event bus and assert the node resumes when an approval event with matching token is published.
  - test_state_persistence: start an execution, simulate process restart, ensure node stores needed state (execution_id, token, resume_point) to resume after restart.

## 2. Task Implementation
- [ ] Implement WaitForApproval node at src/langgraph/nodes/wait_for_approval.py and register it with the LangGraph node registry:
  - Node inputs: approval_token (str) or document_path+phase to auto-create token, timeout_seconds (int, default 86400), poll_interval (int default 5) optional.
  - Behavior: on execution, the node SHOULD NOT busy-wait; instead register a waiter record in the ExecutionWait table with fields (execution_id, node_id, token, created_at, resume_deadline). Use either an async condition variable or subscribe to a pub/sub channel used by the approval API; when an approval event is received with matching token, publish resume event to LangGraph runtime to continue execution.
  - Persistence: write ExecutionWait record so that if the runner restarts, a recovery job can reattach and re-subscribe to pending waiters.
  - Edge cases: if token already approved when node starts, do not block; if token rejected, propagate failure.
  - Add a small in-memory fallback for test environments when external pub/sub not available.

## 3. Code Review
- [ ] Verify implementation adheres to:
  - No CPU-bound busy loops; use event-driven resume via pub/sub or asyncio primitives
  - Proper cleanup of ExecutionWait records on resume/failure
  - Clear logging for suspended and resumed executions, include execution_id and node_id for observability
  - Correct handling of race conditions (approval comes between check and subscribe)

## 4. Run Automated Tests to Verify
- [ ] Run unit and integration tests: pytest -q tests/unit/test_wait_for_approval_node.py and tests/integration/test_wait_for_approval_integration.py (integration should spin up a test event bus or use in-memory fallback). Ensure tests demonstrate suspension and resumption behavior.

## 5. Update Documentation
- [ ] Update docs/langgraph/nodes.md with the new `WaitForApproval` node: describe inputs, outputs, behavior, expected events, and recovery semantics. Add a mermaid sequence diagram showing LangGraph runner -> WaitForApproval -> Approval API -> Approver -> Approval event -> LangGraph resume.

## 6. Automated Verification
- [ ] Add an automated harness tests/e2e/run_wait_for_approval.py which:
  - starts a minimal LangGraph runner in test mode
  - triggers a graph run that includes WaitForApproval
  - creates an approval token and then approves it
  - asserts the runner resumes and the graph completes successfully
  - exits non-zero on failures. This harness should be runnable in CI and used by the phase-6 gating job.
