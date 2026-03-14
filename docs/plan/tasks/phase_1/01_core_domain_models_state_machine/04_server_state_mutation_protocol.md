# Task: Implement ServerState Mutation Protocol (Sub-Epic: 01_Core Domain Models & State Machine)

## Covered Requirements
- [2_TAS-REQ-027]

## Dependencies
- depends_on: [01_run_status_state_machine.md, 02_stage_status_state_machine.md, 03_server_state_structure.md]
- shared_components: [devs-core (Owner), devs-checkpoint (Consumer — checkpoint persistence called after mutation)]

## 1. Initial Test Written
- [ ] Create test module `state_mutation_tests` in `crates/devs-core/tests/` or inline in `state.rs`
- [ ] Write `test_mutation_acquires_write_guard` that demonstrates mutation requires mutable access (write guard semantics) — construct a `WorkflowRun`, apply a `RunEvent::Start` transition, and assert the status changed from `Pending` to `Running`
- [ ] Write `test_mutation_applies_state_machine_transition` that verifies the mutation delegates to `RunStatus::transition()` and propagates `InvalidTransition` errors
- [ ] Write `test_mutation_invalid_transition_returns_error` that attempts an invalid transition (e.g., `Completed -> Running`) and asserts an error is returned without modifying state
- [ ] Write `test_mutation_emits_run_event` that applies a valid transition and asserts a `RunEvent` is produced/recorded
- [ ] Write `test_mutation_sequence_start_then_complete` that applies `Start` then `Complete` in sequence and verifies final state is `Completed` with two events emitted

## 2. Task Implementation
- [ ] Define a `StateMutator` (or equivalent method on `ServerState`) that encapsulates the 5-step mutation protocol from [2_TAS-REQ-027]:
  1. Acquire write guard (via `&mut self` or explicit lock in higher-level code)
  2. Apply transition via the `RunStatus::transition()` state machine
  3. Release guard (implicit via scope/borrow end)
  4. Return checkpoint data (the actual `save_checkpoint` call happens in the server layer, not in devs-core)
  5. Return the `RunEvent` for broadcasting
- [ ] Implement `ServerState::apply_run_transition(&mut self, run_id: &RunId, event: RunEvent) -> Result<RunStateChange, MutationError>` where `RunStateChange` contains the old status, new status, and the event for broadcasting
- [ ] Define `MutationError` enum with variants: `RunNotFound(RunId)`, `InvalidTransition(InvalidTransition)`
- [ ] Ensure the method is atomic at the domain level — if transition fails, no state is modified
- [ ] Add doc comments referencing the 5-step protocol from [2_TAS-REQ-027]

## 3. Code Review
- [ ] Verify the mutation method follows all 5 steps from [2_TAS-REQ-027] (steps 4 and 5 are signaled via return type, not executed in devs-core)
- [ ] Verify failed transitions leave state unchanged
- [ ] Verify `MutationError` provides enough context for callers to handle each case

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- state_mutation` and verify all tests pass
- [ ] Run `cargo clippy -p devs-core -- -D warnings`

## 5. Update Documentation
- [ ] Add doc comment on mutation method describing the 5-step protocol and which steps are handled here vs. by the server layer

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- state_mutation --nocapture 2>&1 | tail -5` and confirm "test result: ok"
