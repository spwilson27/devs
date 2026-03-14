# Task: Implement Snapshot Commit Metadata Convention (Sub-Epic: 030_Foundational Technical Requirements (Part 21))

## Covered Requirements
- [2_TAS-REQ-022C]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (consumer — uses domain types)", "devs-checkpoint (consumer — will use these constants for git commit creation)"]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/snapshot.rs` (or appropriate module), write a unit test `test_snapshot_commit_message_format` that verifies a function `snapshot_commit_message(run_id: &str) -> String` returns exactly `"devs: snapshot <run-id>"` where `<run-id>` is the provided run ID string. Test with multiple run IDs including UUIDs and slug-based IDs.
- [ ] Write a unit test `test_snapshot_git_author` that verifies constants `DEVS_GIT_AUTHOR_NAME` equals `"devs"` and `DEVS_GIT_AUTHOR_EMAIL` equals `"devs@localhost"`.
- [ ] Write a unit test `test_snapshot_commit_message_does_not_contain_extra_whitespace` that ensures no leading/trailing whitespace or newlines in the generated commit message.

## 2. Task Implementation
- [ ] Create a module (e.g., `crates/devs-core/src/snapshot.rs`) or add to an existing git-conventions module in `devs-core`.
- [ ] Define public constants: `pub const DEVS_GIT_AUTHOR_NAME: &str = "devs";` and `pub const DEVS_GIT_AUTHOR_EMAIL: &str = "devs@localhost";`.
- [ ] Implement `pub fn snapshot_commit_message(run_id: &str) -> String` that returns `format!("devs: snapshot {run_id}")`.
- [ ] Export these from the crate's public API so `devs-checkpoint` can consume them.
- [ ] Add `// Covers: 2_TAS-REQ-022C` annotation to all test functions.

## 3. Code Review
- [ ] Verify constants are not duplicated elsewhere in the workspace.
- [ ] Verify the function is pure with no side effects.
- [ ] Verify the module is re-exported from the crate root.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- snapshot` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to the public constants and function explaining the convention from [2_TAS-REQ-022C].

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- snapshot` and verify exit code 0.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-022C" crates/devs-core/` and verify at least one match.
