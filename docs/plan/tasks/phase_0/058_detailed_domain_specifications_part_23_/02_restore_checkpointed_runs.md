# Task: Implement Checkpoint Restoration Logic on Server Startup (Sub-Epic: 058_Detailed Domain Specifications (Part 23))

## Covered Requirements
- [2_TAS-REQ-206]

## Dependencies
- depends_on: []
- shared_components: ["devs-checkpoint (Consumer — uses restore_checkpoints API)", "devs-scheduler (Consumer — re-queues restored runs)", "devs-core (Consumer — WorkflowRunState/StageRunState enums)"]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/src/restore.rs` (create `#[cfg(test)] mod tests`), write the following tests. Each must include `// Covers: 2_TAS-REQ-206`.
- [ ] `test_running_stages_reset_to_eligible`: Create a `CheckpointData` with one run containing a stage in `StageRunState::Running`. Call `restore_checkpoints`. Assert the stage state is now `StageRunState::Eligible`.
- [ ] `test_waiting_and_eligible_stages_requeued`: Create checkpoint data with stages in `Waiting` and `Eligible` states. After restore, assert these stages are present in the returned `Vec<RestoredRun>` with their states preserved (they get re-queued as-is).
- [ ] `test_pending_runs_requeued`: Create a checkpoint with a run in `WorkflowRunState::Pending`. Assert it appears in the restored list for re-submission to the scheduler.
- [ ] `test_completed_and_failed_stages_unchanged`: Stages in `Completed` or `Failed` states must NOT be modified. Assert they retain their original state after restore.
- [ ] `test_one_project_failure_does_not_abort_others`: Set up 3 project checkpoint directories. Make project 2's checkpoint data invalid JSON. Call `restore_all_projects`. Assert projects 1 and 3 are restored successfully. Assert the function returns `Ok` (not `Err`).
- [ ] `test_project_failure_logged_at_error_level`: Use `tracing_test::TracingSubscriber` (or equivalent) to capture log output. Trigger a project restore failure. Assert a log line at `ERROR` level is emitted containing the project name.
- [ ] Write an integration test in `crates/devs-checkpoint/tests/git_restore.rs` that creates a real temporary git repo with a checkpoint branch containing `.devs/runs/<run_id>/checkpoint.json` files, then calls `restore_checkpoints` and verifies correct state transitions.

## 2. Task Implementation
- [ ] In `crates/devs-checkpoint/src/restore.rs`, implement `restore_checkpoints(project: &ProjectRef) -> Result<Vec<RestoredRun>>`:
  - Open the project's git repo via `git2::Repository::open`.
  - Resolve the checkpoint branch (from `project.checkpoint_branch` config).
  - Walk the tree at `.devs/runs/*/checkpoint.json`, deserializing each into `CheckpointData`.
  - For each run: iterate stages and apply crash-recovery transitions: `Running → Eligible`. Leave `Waiting`, `Eligible`, `Completed`, `Failed` unchanged.
  - For each run: if `WorkflowRunState::Pending`, include in output for re-queue.
  - Return `Vec<RestoredRun>` containing all recovered runs with corrected states.
- [ ] In `crates/devs-checkpoint/src/restore.rs`, implement `restore_all_projects(projects: &[ProjectRef]) -> Vec<(ProjectRef, Result<Vec<RestoredRun>>)>`:
  - Iterate all projects. Call `restore_checkpoints` for each.
  - On `Err`, log at `tracing::error!` with the project name and error, then continue.
  - Return the full list of results (successes and failures).
- [ ] All `git2` operations MUST be wrapped in `tokio::task::spawn_blocking` since git2 is synchronous.
- [ ] Define `RestoredRun` struct: `run_id: RunId`, `workflow_name: String`, `stages: Vec<RestoredStage>`, `run_state: WorkflowRunState`.
- [ ] Define `CheckpointData` as a deserializable struct matching the `.devs/runs/<id>/checkpoint.json` schema.

## 3. Code Review
- [ ] Verify `Running → Eligible` is the ONLY crash-recovery state transition applied (no other states are modified).
- [ ] Verify per-project error isolation: one project's failure MUST NOT prevent other projects from restoring.
- [ ] Verify `tracing::error!` is used (not `eprintln!` or `log::error!`) for failed project restorations.
- [ ] Verify all `git2` calls are inside `spawn_blocking`.
- [ ] Verify no `anyhow` dependency in this library crate [2_TAS-REQ-234 cross-reference].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- restore` and confirm all tests pass.
- [ ] Run the integration test `cargo test -p devs-checkpoint --test git_restore` and confirm it passes.

## 5. Update Documentation
- [ ] Add doc comments on `restore_checkpoints` and `restore_all_projects` referencing [2_TAS-REQ-206].
- [ ] Document the crash-recovery state transition table in a module-level doc comment.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Run `./do lint` and confirm zero warnings.
- [ ] Grep for `// Covers: 2_TAS-REQ-206` to confirm traceability annotation is present in test code.
