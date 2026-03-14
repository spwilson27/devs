# Task: Implement Checkpoint Restore for Crash Recovery (Sub-Epic: 04_Persistence & Checkpoints)

## Covered Requirements
- [1_PRD-REQ-029]

## Dependencies
- depends_on: ["02_atomic_checkpoint_save.md", "04_configurable_checkpoint_branch.md"]
- shared_components: [devs-core (consume), devs-checkpoint (own)]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/tests/restore_tests.rs`, write `test_restore_returns_empty_for_no_checkpoints` that initializes a fresh git repo and asserts `restore_checkpoints` returns an empty `Vec`.
- [ ] Write `test_restore_single_run` that saves one checkpoint, then calls `restore_checkpoints` and asserts the returned `Vec` contains exactly one `WorkflowRun` with matching `run_id` and stage data.
- [ ] Write `test_restore_multiple_runs` that saves 3 checkpoints for different run IDs, then restores and asserts all 3 are returned with correct data.
- [ ] Write `test_restore_from_dedicated_branch` that saves checkpoints on `CheckpointBranch::Dedicated("devs/state")`, then restores using the same config and asserts runs are found.
- [ ] Write `test_restore_skips_corrupt_checkpoint` that saves 2 valid checkpoints then manually writes an invalid JSON blob to a third run's `checkpoint.json` in the git tree. Asserts `restore_checkpoints` returns the 2 valid runs and logs a warning (does not fail entirely).
- [ ] Write `test_restore_deserializes_schema_version_1` that saves a checkpoint, restores it, and asserts the deserialized data includes `schema_version: 1`.

## 2. Task Implementation
- [ ] Implement `restore_checkpoints` in `GitCheckpointStore`:
  1. Open the repo, resolve the checkpoint branch (working or dedicated).
  2. If the branch doesn't exist, return empty `Vec` (no checkpoints yet).
  3. Walk the `.devs/runs/` tree in the branch's HEAD commit.
  4. For each subdirectory, read `checkpoint.json` blob.
  5. Deserialize each blob to `WorkflowRun` wrapped in `CheckpointMetadata`. Validate `schema_version`.
  6. On deserialization failure, log a warning and skip the corrupt entry — do NOT abort the entire restore.
  7. Return all successfully deserialized runs.
- [ ] All git2 tree-walking and blob reads run inside `spawn_blocking`.
- [ ] Add `tracing::warn!` for corrupt/unreadable checkpoints with the run directory name.

## 3. Code Review
- [ ] Verify resilience: corrupt checkpoints are skipped, not fatal.
- [ ] Verify the restore reads from the configured branch (not always HEAD).
- [ ] Verify `spawn_blocking` wraps all git2 calls.
- [ ] Verify schema version validation is present.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- restore` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-029` to `test_restore_single_run`, `test_restore_multiple_runs`, and `test_restore_skips_corrupt_checkpoint`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-checkpoint` and verify zero failures.
- [ ] Run `cargo clippy -p devs-checkpoint -- -D warnings` and verify zero warnings.
