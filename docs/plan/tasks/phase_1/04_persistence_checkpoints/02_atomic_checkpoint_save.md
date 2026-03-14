# Task: Implement Atomic Checkpoint Save with Git Commit (Sub-Epic: 04_Persistence & Checkpoints)

## Covered Requirements
- [2_TAS-REQ-017], [1_PRD-REQ-029]

## Dependencies
- depends_on: [01_checkpoint_crate_scaffold_and_store_trait.md]
- shared_components: [devs-core (consume), devs-proto (consume), devs-checkpoint (own)]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/tests/save_checkpoint_tests.rs`, write `test_save_checkpoint_creates_dotdevs_directory` that initializes a bare git repo in a tempdir, calls `save_checkpoint` with a mock `WorkflowRun`, and asserts the `.devs/runs/<run_id>/checkpoint.json` file exists in the committed tree.
- [ ] Write `test_checkpoint_json_contains_schema_version` that saves a checkpoint, reads back the committed `checkpoint.json` blob, deserializes it, and asserts `schema_version == 1`.
- [ ] Write `test_checkpoint_json_contains_full_workflow_run` that saves a checkpoint with 2 stage runs, reads back the blob, and asserts both stage runs are present in the deserialized output with correct status values.
- [ ] Write `test_save_checkpoint_is_atomic_on_rename_failure` that simulates a write failure (e.g., read-only directory) and asserts no partial checkpoint.json is left behind — the previous checkpoint (if any) remains intact.
- [ ] Write `test_save_checkpoint_uses_spawn_blocking` using a Tokio multi-threaded runtime and asserting the operation completes without blocking the executor (verify by running a concurrent timer task that completes within expected bounds).
- [ ] Write `test_save_checkpoint_creates_git_commit` that saves a checkpoint and asserts the HEAD of the target branch has a new commit with message containing the run ID.

## 2. Task Implementation
- [ ] Implement `GitCheckpointStore` struct in `crates/devs-checkpoint/src/git_store.rs` implementing `CheckpointStore`.
- [ ] `save_checkpoint` implementation:
  1. Serialize `WorkflowRun` to JSON with `CheckpointMetadata` wrapper containing `schema_version: 1`.
  2. Write JSON to a temp file in the same directory as the target path using `tempfile::NamedTempFile`.
  3. Call `rename()` to atomically move temp file to `.devs/runs/<run_id>/checkpoint.json`.
  4. Open the git repo via `git2::Repository::open()` inside `tokio::task::spawn_blocking`.
  5. Stage the checkpoint file via `git2::Index::add_path()`.
  6. Create a commit on the configured branch with message `"devs: checkpoint <run_id>"`.
  7. If the target branch doesn't exist, create it as an orphan branch.
- [ ] Wrap all `git2` calls in `spawn_blocking` closures to avoid blocking the Tokio runtime.
- [ ] Implement proper error mapping from `git2::Error` and `std::io::Error` to `CheckpointError`.

## 3. Code Review
- [ ] Verify atomic write pattern: temp file created in same filesystem, then `rename()`.
- [ ] Verify all `git2` operations are inside `spawn_blocking`.
- [ ] Verify `CheckpointMetadata` wrapper includes `schema_version: 1` as required by 2_TAS-REQ-017.
- [ ] Verify the full `WorkflowRun` (including all `StageRun` records) is serialized as required by 2_TAS-REQ-017.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- save_checkpoint` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-017` to `test_checkpoint_json_contains_schema_version` and `test_checkpoint_json_contains_full_workflow_run`.
- [ ] Add `// Covers: 1_PRD-REQ-029` to `test_save_checkpoint_creates_git_commit`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-checkpoint` and verify zero failures.
- [ ] Run `cargo clippy -p devs-checkpoint -- -D warnings` and verify zero warnings.
