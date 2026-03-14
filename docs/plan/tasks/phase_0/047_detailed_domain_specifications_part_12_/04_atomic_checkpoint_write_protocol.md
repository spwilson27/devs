# Task: Implement Atomic Checkpoint Write Protocol (Sub-Epic: 047_Detailed Domain Specifications (Part 12))

## Covered Requirements
- [2_TAS-REQ-109]

## Dependencies
- depends_on: ["03_git_checkpoint_store_foundation.md"]
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint/src/store/atomic_write_tests.rs` that:
    - Mocks a filesystem to track file creation and renames.
    - Triggers a checkpoint write and asserts that:
        1. `checkpoint.json.tmp` is created.
        2. `fsync` is called on the temp file (simulated).
        3. `rename` is called to replace `checkpoint.json`.
        4. `.tmp` file is removed if any intermediate step fails.
- [ ] Create an integration test that verifies a commit is created in the bare repository with the message format: `devs: checkpoint <run-id> stage=<name> status=<status>`.
- [ ] Verify that a failed push does not cause the stage to fail, but logs a `WARN`.

## 2. Task Implementation
- [ ] Implement `write_checkpoint(run: &WorkflowRun, stage_name: Option<&str>)` in `GitCheckpointStore`.
- [ ] Use `serde_json` to serialize the `WorkflowRun` to bytes.
- [ ] Implement the atomic write sequence: `write` to `.tmp`, `fsync`, `rename`.
- [ ] Use `git2` to stage the `checkpoint.json` and any stage-specific files.
- [ ] Create a commit using the mandatory message format and the `devs` signature.
- [ ] Implement a `push()` method that handles network failures by logging a `WARN` and retaining the commit locally.

## 3. Code Review
- [ ] Confirm the atomic write protocol follows all 7 steps in [2_TAS-REQ-109].
- [ ] Ensure the commit message format matches the requirement exactly.
- [ ] Verify that `fsync` is called before renaming.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and ensure atomic write tests pass.

## 5. Update Documentation
- [ ] Document the atomic write protocol and error handling (specifically push failures) in `devs-checkpoint/src/store.rs`.

## 6. Automated Verification
- [ ] Verify the traceability tag: `// Covers: 2_TAS-REQ-109` is present in the test file.
- [ ] Run `./do lint` to ensure code quality.
