# Task: Implement Shutdown State Persistence Logic (Sub-Epic: 017_Foundational Technical Requirements (Part 8))

## Covered Requirements
- [2_TAS-REQ-002C]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/017_foundational_technical_requirements_part_8_/01_implement_discovery_file_logic.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-core/src/shutdown.rs` (or equivalent persistence utility):
  - Setup a mock state containing several runs in `Running`, `Pending`, `Completed`, and `Cancelled` states.
  - Test a function `identify_runs_to_persist(state: &SchedulerState) -> Vec<RunID>` that correctly returns all runs currently in a `Running` state.
  - Test that for these runs, their current in-memory state can be correctly prepared for a final checkpoint write.
- [ ] Test the "mark for restart" logic:
  - Verify that `Running` stages are marked such that they satisfy the recovery rule (status is recorded in a way that recovery can reset them to `Eligible`).
  - Note: Recovery itself is handled by [2_TAS-REQ-110], but the persistence must happen *before* exit.

## 2. Task Implementation
- [ ] Implement a `ShutdownPersister` utility or method within the `StateMachine` or `persistence.rs` module.
- [ ] Implement the logic to scan the `SchedulerState` and identify all `WorkflowRun` and `StageRun` instances that are currently `Running`.
- [ ] Implement a method `prepare_shutdown_checkpoint(run: &WorkflowRun) -> CheckpointData` that prepares the data to be persisted to git.
- [ ] Ensure that this persistence logic is integrated into the `devs-core` state machine utilities for use during the shutdown sequence.
- [ ] Note: The actual git writing will be done by `devs-checkpoint`, but the logic to identify and prepare the data for the shutdown checkpoint must exist in `devs-core`.

## 3. Code Review
- [ ] Verify that no `Running` runs are missed during the shutdown identification scan.
- [ ] Ensure that the persisted state will correctly transition to `Eligible` on restart according to the recovery rules.
- [ ] Confirm that the implementation uses the domain types from `devs-core` and is free from networking/IO logic (the actual write call will be made by a consumer crate).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib shutdown` and ensure the state preparation tests pass.

## 5. Update Documentation
- [ ] Add doc comments to the shutdown persistence utility explaining its role in the graceful shutdown sequence.

## 6. Automated Verification
- [ ] Run `grep -r "2_TAS-REQ-002C" crates/devs-core/` to verify traceability of the shutdown persistence requirement.
