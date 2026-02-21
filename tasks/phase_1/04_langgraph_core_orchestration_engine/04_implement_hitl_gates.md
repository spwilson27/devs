# Task: Implement HITL Approval Gates (Sub-Epic: 04_LangGraph Core Orchestration Engine)

## Covered Requirements
- [TAS-078], [9_ROADMAP-PHASE-001]

## 1. Initial Test Written
- [ ] Create a test case in `packages/core/src/orchestration/__tests__/hitl.test.ts` to simulate a "Human-in-the-Loop" approval gate.
- [ ] Verify that the graph enters a `SUSPENDED` or `WAITING` state when it reaches an approval node.
- [ ] Verify that the graph only proceeds once a specific "Approval Signal" is received in the state.

## 2. Task Implementation
- [ ] Add explicit HITL nodes/edges to the LangGraph:
    - `approveDesignNode`: Stops execution after PRD/TAS generation for user review.
    - `approveTaskDagNode`: Stops execution after requirement distillation for DAG approval.
- [ ] Implement a signaling mechanism (e.g., using LangGraph's `interrupt` or a custom `status` field in the state).
- [ ] Ensure the `status` table in SQLite is updated to `PAUSED_FOR_APPROVAL`.
- [ ] Integrate with the `EventBus` (if implemented) to emit an event that the CLI or VSCode Extension can catch to prompt the user.
- [ ] Implement the `resume` logic that takes the user's feedback/approval and updates the state to allow the graph to proceed.

## 3. Code Review
- [ ] Verify that the orchestrator cannot bypass approval gates autonomously.
- [ ] Ensure the user feedback is persisted in the `Decision Logs` or `agent_logs` table.
- [ ] Check that the IPC/Socket layer is notified of the pause.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core` and ensure HITL signal tests pass.

## 5. Update Documentation
- [ ] Update the Project Roadmap (docs) to reflect mandatory approval junctions as per 5_SECURITY_DESIGN-REQ-SEC-SD-022.

## 6. Automated Verification
- [ ] Use a CLI mock script to "approve" a suspended graph and verify it transitions to the next implementation node.
