# Task: Implement Shutdown State Persistence Logic (Sub-Epic: 017_Foundational Technical Requirements (Part 8))

## Covered Requirements
- [2_TAS-REQ-002C]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (owner — this task adds shutdown checkpoint preparation types and logic), devs-checkpoint (consumer — actual git persistence is delegated to devs-checkpoint in Phase 1, but the domain logic for identifying and preparing state lives here)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/shutdown.rs` and add `mod shutdown;` to `crates/devs-core/src/lib.rs`.
- [ ] Write the following unit tests (all should fail initially):

### Identifying Running State Tests
- [ ] `test_identify_running_workflow_runs`: Create a `Vec<WorkflowRunSnapshot>` containing runs in states `Running`, `Completed`, `Cancelled`, `Pending`, `Failed`. Call `collect_running_state(&runs)`. Assert the result contains exactly the `Running` runs.
- [ ] `test_identify_running_stage_runs`: Create a `WorkflowRunSnapshot` with stages in states `Running`, `Completed`, `Eligible`, `Pending`. Call `collect_running_stages(&run)`. Assert the result contains exactly the `Running` stages.
- [ ] `test_empty_state_returns_empty`: Call `collect_running_state(&[])`. Assert the result is an empty vec.
- [ ] `test_no_running_returns_empty`: Create state with only `Completed` and `Failed` runs. Assert `collect_running_state` returns empty.

### Preparing Checkpoint Data Tests
- [ ] `test_prepare_shutdown_checkpoint_marks_running_stages_for_recovery`: Create a `WorkflowRunSnapshot` with two `Running` stages and one `Completed` stage. Call `prepare_shutdown_checkpoint(&run)`. Assert:
  - The returned `ShutdownCheckpoint` contains the full run.
  - The `Running` stages have their status set to `InterruptedForRecovery` (or equivalent marker that recovery logic in [2_TAS-REQ-110] will map to `Eligible`).
  - The `Completed` stage retains its `Completed` status unchanged.
- [ ] `test_prepare_shutdown_checkpoint_preserves_run_metadata`: Assert that run ID, workflow name, inputs, start time, and other metadata are preserved exactly in the `ShutdownCheckpoint`.
- [ ] `test_prepare_shutdown_checkpoint_sets_checkpoint_reason`: Assert that the `ShutdownCheckpoint` has a `reason` field set to `ShutdownReason::GracefulShutdown`.
- [ ] `test_multiple_runs_produce_multiple_checkpoints`: Create 3 running runs. Call `prepare_shutdown_checkpoints(&runs)`. Assert 3 `ShutdownCheckpoint` values are returned.

## 2. Task Implementation
- [ ] Define the following types in `crates/devs-core/src/shutdown.rs`:
  - `ShutdownReason` enum: `GracefulShutdown`, `ImmediateEscalation`
  - `ShutdownCheckpoint` struct: `{ run: WorkflowRunSnapshot, reason: ShutdownReason, timestamp: DateTime<Utc> }` — represents a single run's state prepared for persistence.
  - Note: `WorkflowRunSnapshot` and `StageRunSnapshot` are lightweight structs defined here (or in a sibling module) representing the serializable state of a run. They must be pure data types — no tokio, no I/O. If these types already exist in `devs-core` from another task, reuse them.
- [ ] Implement `pub fn collect_running_state(runs: &[WorkflowRunSnapshot]) -> Vec<&WorkflowRunSnapshot>`:
  - Filter to runs where `status == RunStatus::Running`.
- [ ] Implement `pub fn collect_running_stages(run: &WorkflowRunSnapshot) -> Vec<&StageRunSnapshot>`:
  - Filter to stages where `status == StageStatus::Running`.
- [ ] Implement `pub fn prepare_shutdown_checkpoint(run: &WorkflowRunSnapshot, reason: ShutdownReason) -> ShutdownCheckpoint`:
  - Clone the run.
  - For each stage with status `Running`, set status to `InterruptedForRecovery`.
  - Set the checkpoint reason and timestamp.
  - Return the `ShutdownCheckpoint`.
- [ ] Implement `pub fn prepare_shutdown_checkpoints(runs: &[WorkflowRunSnapshot], reason: ShutdownReason) -> Vec<ShutdownCheckpoint>`:
  - Filter to running runs via `collect_running_state`, then map each through `prepare_shutdown_checkpoint`.
- [ ] Add `// Covers: 2_TAS-REQ-002C` comment above `prepare_shutdown_checkpoint` and `prepare_shutdown_checkpoints`.

## 3. Code Review
- [ ] Verify that ALL `Running` runs and stages are captured — no early returns or short-circuits that could miss entries.
- [ ] Verify that `InterruptedForRecovery` is a distinct status value that cannot be confused with `Eligible`, `Failed`, or `Cancelled`. Recovery logic (Phase 1) will map it to `Eligible`.
- [ ] Confirm that `Completed`, `Failed`, `Cancelled` stages are never modified by the shutdown checkpoint logic.
- [ ] Ensure no I/O or async code — this module must be pure domain logic callable from any context.
- [ ] Verify that `ShutdownCheckpoint` is `Serialize`-able (derive `serde::Serialize`) so that `devs-checkpoint` can persist it.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib shutdown` and ensure all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and ensure no warnings.

## 5. Update Documentation
- [ ] Add module-level doc comment to `shutdown.rs` explaining: this module provides the domain logic for identifying and preparing in-flight workflow state during server shutdown, per [2_TAS-REQ-002C]. Actual git persistence is performed by `devs-checkpoint`.
- [ ] Add doc comments to each public type and function.

## 6. Automated Verification
- [ ] Run `grep -rn "Covers:.*2_TAS-REQ-002C" crates/devs-core/src/` and verify at least one match.
- [ ] Run `cargo test -p devs-core --lib shutdown 2>&1 | tail -1` and verify it shows `test result: ok`.
