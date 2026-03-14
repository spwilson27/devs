# Task: Implement Crash-Recovery State Transformation Rules (Sub-Epic: 02_State Recovery and Lifecycle)

## Covered Requirements
- [1_PRD-REQ-031], [2_TAS-REQ-026]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer — uses WorkflowRunState/StageRunState enums and state machine transitions)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/recovery.rs`, create a new module `recovery` (add `pub mod recovery;` to `lib.rs`).
- [ ] Write unit test `test_running_stages_reset_to_eligible`: construct a `WorkflowRun` containing three `StageRun` entries — one `Running`, one `Completed`, one `Waiting`. Call `apply_crash_recovery(&mut run)`. Assert the `Running` stage is now `Eligible`, `Completed` remains `Completed`, `Waiting` remains `Waiting`.
- [ ] Write unit test `test_eligible_stages_remain_eligible`: construct a run with an `Eligible` stage. After recovery, assert it stays `Eligible`.
- [ ] Write unit test `test_pending_run_stays_pending`: construct a `WorkflowRun` with state `Pending` and no stages started. After recovery, assert run state is still `Pending`.
- [ ] Write unit test `test_running_run_with_all_stages_terminal_resolves`: construct a run in `Running` state where all stages are `Completed` or `Failed` (simulating a crash between stage completion and run finalization). After recovery, assert run state resolves to `Completed` (all success) or `Failed` (any failure).
- [ ] Write unit test `test_recovery_is_idempotent`: apply `apply_crash_recovery` twice to the same run. Assert the second call produces no state changes.
- [ ] Add `// Covers: 1_PRD-REQ-031` and `// Covers: 2_TAS-REQ-026` annotations to each test.

## 2. Task Implementation
- [ ] Implement `pub fn apply_crash_recovery(run: &mut WorkflowRun)` in `crates/devs-core/src/recovery.rs`.
- [ ] The function iterates all stages in the run: any stage in `Running` state is transitioned to `Eligible` using the existing `StageRunState` state machine (or directly if no transition method exists for this recovery path — document the rationale).
- [ ] After stage recovery, if the `WorkflowRun` itself is in `Running` state, check whether all stages have reached a terminal state (`Completed` or `Failed`). If so, resolve the run to `Completed` (if all stages succeeded) or `Failed` (if any stage failed). This handles the edge case where a crash occurred after the last stage finished but before the run was finalized.
- [ ] The function MUST be pure — no I/O, no logging, no side effects. It operates solely on the in-memory `WorkflowRun` struct.
- [ ] Ensure `Eligible` stages are not re-queued here; that is the scheduler's responsibility after recovery.

## 3. Code Review
- [ ] Verify the function handles all `StageRunState` variants exhaustively (use a `match` with no wildcard arm).
- [ ] Verify `WorkflowRunState` resolution logic matches the project description: zero exit code = success, non-zero = failure.
- [ ] Confirm no `unwrap()` or `panic!()` calls — all paths return gracefully.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-core -- recovery`

## 5. Update Documentation
- [ ] Add doc comments to `apply_crash_recovery` explaining the three guarantees from [1_PRD-REQ-031]: crash survival, inspectability, reproducibility.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` includes coverage entries for `1_PRD-REQ-031` and `2_TAS-REQ-026`.
