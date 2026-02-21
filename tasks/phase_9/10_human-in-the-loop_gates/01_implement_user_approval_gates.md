# Task: Implement User Approval & HITL Autonomy Gates (Sub-Epic: 10_Human-in-the-Loop & Gates)

## Covered Requirements
- [TAS-015], [TAS-048]

## 1. Initial Test Written
- [ ] Write unit tests for `HumanInTheLoopGate` LangGraph node in `tests/orchestrator/hitl_gate.test.ts`. The test should mock an orchestrator state pausing execution when reaching the `BlueprintGenerated` or `RoadmapGenerated` state.
- [ ] Write integration tests verifying that the orchestrator requires a signed user approval token (e.g. `human_approval_signature`) before transitioning from Phase 2 (Blueprinting) to Phase 3 (Distillation).

## 2. Task Implementation
- [ ] Implement the `HumanInTheLoopGate` node in `src/orchestrator/nodes/HumanInTheLoopGate.ts`.
- [ ] Update the LangGraph state machine configuration in `src/orchestrator/graph.ts` to insert the `HumanInTheLoopGate` at the end of the Phase 2 (Documentation & Blueprinting) and Phase 5 (Roadmap Generation) workflows.
- [ ] Expose an MCP tool `approve_checkpoint` in `src/mcp/tools.ts` that allows the VSCode extension/CLI to submit the user approval boolean or signature to unpause the graph.
- [ ] Update the SQLite checkpointer logic to ensure that a paused graph state is safely persisted and can be resumed upon receiving the user approval event.

## 3. Code Review
- [ ] Verify that the `HumanInTheLoopGate` correctly serializes the wait state without data loss.
- [ ] Ensure that the `approve_checkpoint` tool securely validates the origin of the request (to prevent an agent from approving its own work).

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test tests/orchestrator/hitl_gate.test.ts` to ensure the gate pauses correctly.
- [ ] Run the full test suite `npm run test` to verify no regressions in the state machine transitions.

## 5. Update Documentation
- [ ] Add Agent-Oriented Documentation (AOD) in `.agent/hitl_gates.agent.md` describing how the `HumanInTheLoopGate` node interrupts the standard cycle and how an agent should handle an `AWAITING_APPROVAL` status.
- [ ] Update `docs/architecture/state_machine.md` with a Mermaid diagram showing the new gate nodes.

## 6. Automated Verification
- [ ] Create a mock workflow script `scripts/verify_hitl.ts` that attempts to run the full pipeline without approval, asserting that it hangs or errors at the correct checkpoint. Then, send an approval signal and assert that it continues.
