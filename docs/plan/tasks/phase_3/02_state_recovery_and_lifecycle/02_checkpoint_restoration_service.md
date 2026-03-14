# Task: Implement Checkpoint Deserialization and Project-Scoped Restoration (Sub-Epic: 02_State Recovery and Lifecycle)

## Covered Requirements
- [1_PRD-REQ-031], [2_TAS-REQ-026]

## Dependencies
- depends_on: ["phase_3/02_state_recovery_and_lifecycle/01_crash_recovery_logic.md"]
- shared_components: [devs-checkpoint (consumer — uses restore_checkpoints), devs-config (consumer — uses ProjectEntry/ProjectRegistry), devs-core (consumer — uses apply_crash_recovery)]

## 1. Initial Test Written
- [ ] Create `crates/devs-server/src/startup/restore.rs` (or appropriate module path) and add unit/integration tests.
- [ ] Write test `test_restore_single_project_with_checkpoints`: set up a temporary git repo with `.devs/runs/<run-id>/checkpoint.json` files containing serialized `WorkflowRun` data. Create a `ProjectEntry` pointing to this repo. Call the restoration function. Assert it returns the deserialized runs with crash-recovery rules already applied (i.e., any formerly `Running` stages are now `Eligible`).
- [ ] Write test `test_restore_multiple_projects`: set up two temporary git repos with checkpoints. Call the restoration function with both projects. Assert runs from both projects are returned, keyed by project.
- [ ] Write test `test_restore_corrupt_checkpoint_skipped`: create a project with one valid and one malformed `checkpoint.json` (invalid JSON). Assert the valid run is restored and the corrupt one is skipped with an error logged (use a test logger or capture `tracing` output).
- [ ] Write test `test_restore_missing_project_repo_skipped`: configure a `ProjectEntry` with a non-existent repo path. Assert the restoration function does not panic, logs an error, and continues with remaining projects.
- [ ] Write test `test_restore_empty_project_returns_empty`: project repo exists but has no `.devs/runs/` directory. Assert an empty result set.
- [ ] Add `// Covers: 1_PRD-REQ-031` and `// Covers: 2_TAS-REQ-026` annotations.

## 2. Task Implementation
- [ ] Implement `pub async fn restore_all_projects(registry: &ProjectRegistry, checkpoint_store: &dyn CheckpointStore) -> HashMap<ProjectId, Vec<WorkflowRun>>` in `crates/devs-server/src/startup/restore.rs`.
- [ ] For each project in the registry, call `checkpoint_store.restore_checkpoints(project)` (from the `devs-checkpoint` shared component). This reads all `checkpoint.json` files from the project's configured checkpoint branch under `.devs/runs/`.
- [ ] For each restored `WorkflowRun`, call `devs_core::recovery::apply_crash_recovery(&mut run)` to apply the state transformation rules from Task 01.
- [ ] Wrap each project's restoration in a `match` or `try` block so that a failure in one project (corrupt repo, missing branch, I/O error) does not abort restoration of other projects. Log errors at `error!` level with the project name and error details.
- [ ] Use `spawn_blocking` for any `git2` operations (as required by the Shared State & Concurrency Patterns component).
- [ ] Return the collected map of project → recovered runs.

## 3. Code Review
- [ ] Verify that the function signature uses trait objects (`&dyn CheckpointStore`) to allow test mocking.
- [ ] Verify error isolation: one project's failure must not affect others.
- [ ] Confirm that `spawn_blocking` is used for git2 calls (no blocking the async runtime).

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-server -- restore`

## 5. Update Documentation
- [ ] Add doc comments to `restore_all_projects` describing the restoration sequence from [2_TAS-REQ-026] steps 1–3.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` includes coverage entries for `1_PRD-REQ-031` and `2_TAS-REQ-026`.
