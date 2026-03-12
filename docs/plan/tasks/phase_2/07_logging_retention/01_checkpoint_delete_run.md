# Task: Implement Run Deletion Primitive in devs-checkpoint (Sub-Epic: 07_Logging & Retention)

## Covered Requirements
- [1_PRD-REQ-032], [2_TAS-REQ-087]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint/src/store.rs` (or equivalent) for `CheckpointStore::delete_run`.
- [ ] The test should use a temporary directory to simulate a project repo with multiple run directories under `.devs/runs/` and `.devs/logs/`.
- [ ] Use `mockall` to mock the git operations or verify that the correct git commands/library calls are made (deletion commit on the checkpoint branch).
- [ ] Verify that after calling `delete_run(run_id)`, the corresponding directories `.devs/runs/<run-id>` and `.devs/logs/<run-id>` are removed from the filesystem.
- [ ] Verify that a git commit is recorded with the message: `devs: delete run <run-id>`.

## 2. Task Implementation
- [ ] Add `delete_run(&self, run_id: &RunID) -> Result<()>` to the `CheckpointStore` trait and implementation in `devs-checkpoint`.
- [ ] Implementation must:
    - [ ] Locate the run directory: `.devs/runs/<run-id>`.
    - [ ] Locate the log directory: `.devs/logs/<run-id>`.
    - [ ] Recursively delete both directories if they exist.
    - [ ] Use `git2` to stage the deletions.
    - [ ] Create a commit on the project's configured checkpoint branch with the authoritative identity `devs <devs@localhost>`.
    - [ ] The commit message MUST follow the format: `devs: delete run <run-id>`.
    - [ ] Ensure the operation is atomic or handles partial failures gracefully (e.g., directory already gone).

## 3. Code Review
- [ ] Verify that `git2` is used exclusively and no shell calls to `git` are made [2_TAS-REQ-108].
- [ ] Ensure `pub(crate)` or `pub` visibility is appropriate for the new method.
- [ ] Verify that doc comments are present and mention requirement coverage.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint`.
- [ ] Verify 100% pass rate for deletion tests.

## 5. Update Documentation
- [ ] Update `devs-checkpoint` README or internal docs to reflect the new deletion capability.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows coverage for `2_TAS-REQ-087`.
