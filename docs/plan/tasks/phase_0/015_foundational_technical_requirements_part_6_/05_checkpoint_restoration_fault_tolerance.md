# Task: Checkpoint Restoration Fault Tolerance (Sub-Epic: 015_Foundational Technical Requirements (Part 6))

## Covered Requirements
- [2_TAS-REQ-001K]

## Dependencies
- depends_on: []
- shared_components: [devs-checkpoint (consumer), devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-checkpoint/tests/restoration_fault_tolerance.rs` with a test that sets up three project directories: two with valid checkpoint branches and one with a corrupt/missing git repo (e.g., delete the `.git` directory). Call `restore_all_checkpoints(projects)` and assert: (a) checkpoints from the two valid projects are returned, (b) no panic or fatal error occurs, (c) the function returns successfully.
- [ ] Write a test where one project's checkpoint branch does not exist (valid git repo but branch `devs/state` is missing). Assert the function logs an error for that project and returns checkpoints from the other projects.
- [ ] Write a test that verifies an `ERROR`-level log message is emitted for the failing project. Use a log capture mechanism (e.g., `tracing-test` or a custom subscriber) to assert the log contains the project name and the nature of the failure.
- [ ] Write a test with zero projects that have valid checkpoints (all fail). Assert the function returns an empty Vec and does not error.
- [ ] Write a test with all projects having valid checkpoints. Assert all checkpoints are returned.

## 2. Task Implementation
- [ ] In `devs-checkpoint`, implement `pub async fn restore_all_checkpoints(projects: &[ProjectRef]) -> Vec<(ProjectRef, Vec<WorkflowRun>)>` that iterates over all projects, calling `restore_checkpoints()` for each. Wrap each call in a `match` or `Result` handler: on `Err`, log an `ERROR`-level message with the project identifier and error details, then `continue` to the next project.
- [ ] Use `tracing::error!` for the error log with structured fields: `project = %project.name, error = %err`.
- [ ] Ensure the per-project `restore_checkpoints()` runs on `spawn_blocking` (since it uses `git2`) and any panic in `git2` is caught via `catch_unwind` or by the `spawn_blocking` task boundary.
- [ ] In the server startup path (step 8), call `restore_all_checkpoints()` and proceed with whatever checkpoints were successfully loaded.

## 3. Code Review
- [ ] Verify no `unwrap()` or `?` on per-project restoration results that would short-circuit the loop.
- [ ] Verify the error log is at `ERROR` level (not `WARN` or `INFO`).
- [ ] Verify the function signature returns partial results, not `Result<..>` that would force all-or-nothing.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint --test restoration_fault_tolerance` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on `restore_all_checkpoints` describing the partial-failure contract, referencing `[2_TAS-REQ-001K]`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all new tests pass.
- [ ] Verify `// Covers: 2_TAS-REQ-001K` annotation exists in the test file.
