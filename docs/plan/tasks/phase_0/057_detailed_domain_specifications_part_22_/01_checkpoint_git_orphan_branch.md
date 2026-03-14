# Task: Checkpoint Git Orphan Branch Creation (Sub-Epic: 057_Detailed Domain Specifications (Part 22))

## Covered Requirements
- [2_TAS-REQ-156]

## Dependencies
- depends_on: []
- shared_components: ["devs-checkpoint (consumer — this task defines the domain logic and tests for the orphan branch creation behavior; the actual `devs-checkpoint` crate is owned by Phase 1)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/checkpoint/branch_policy.rs` (or equivalent module path) with a `#[cfg(test)] mod tests` block.
- [ ] **Test: `test_orphan_branch_has_no_parent_commits`** — Given a fresh `git2::Repository` initialized with `git_init()` containing a single commit on `main`, call `ensure_checkpoint_branch(repo, "devs/state")`. Assert:
  - The reference `refs/heads/devs/state` exists.
  - The tip commit of `devs/state` has zero parents (`commit.parent_count() == 0`).
  - The `main` branch tip is unchanged (same OID as before the call).
- [ ] **Test: `test_orphan_branch_idempotent`** — Call `ensure_checkpoint_branch` twice with the same branch name. Assert the second call returns `Ok(())` without creating a duplicate branch or additional commits.
- [ ] **Test: `test_checkpoint_commit_targets_state_branch_only`** — After creating the orphan branch, call a `commit_checkpoint(repo, "devs/state", &checkpoint_json)` function. Assert:
  - A new commit exists on `devs/state` containing a blob with the checkpoint JSON.
  - The `main` branch OID is identical to its value before the checkpoint commit.
  - `git2::Repository::merge_base(main_oid, state_oid)` returns an error (no common ancestor).
- [ ] **Test: `test_checkpoint_commit_message_format`** — Assert the commit message matches the format `devs: checkpoint <run-id> stage=<name> status=<status>` and the author is `devs <devs@localhost>`.
- [ ] **Test: `test_main_branch_not_written`** — Attempt to write a checkpoint when `AutoCollect` is NOT configured. Assert the main branch ref is untouched. This is a negative test ensuring the isolation invariant.

## 2. Task Implementation
- [ ] Define a `CheckpointBranchPolicy` struct (or free functions) in `devs-core` that encapsulates the orphan branch logic. This is a pure domain specification — it will be consumed by the `devs-checkpoint` crate in Phase 1.
- [ ] Implement `ensure_checkpoint_branch(repo: &git2::Repository, branch_name: &str) -> Result<git2::Oid, CheckpointError>`:
  - Check if `refs/heads/{branch_name}` exists via `repo.find_branch(branch_name, BranchType::Local)`.
  - If it exists, return the tip OID.
  - If not, create an orphan branch: build an empty tree via `repo.treebuilder(None)?.write()`, then `repo.commit(Some(&format!("refs/heads/{branch_name}")), &sig, &sig, "devs: init checkpoint branch", &empty_tree, &[])` — note the empty parents slice `&[]` which makes it an orphan.
- [ ] Implement `commit_checkpoint(repo: &git2::Repository, branch_name: &str, run_id: &str, stage: &str, status: &str, data: &[u8]) -> Result<git2::Oid, CheckpointError>`:
  - Resolve the current tip of the branch.
  - Create a blob from `data`, build a tree containing it at path `checkpoints/{run_id}.json`.
  - Commit with parent = current tip, author = `devs <devs@localhost>`, message = `devs: checkpoint {run_id} stage={stage} status={status}`.
  - Update the branch ref to the new commit.
- [ ] Define `CheckpointError` enum with variants: `BranchCreationFailed`, `CommitFailed`, `InvalidRepository`.
- [ ] All `git2` calls must be wrapped in `Result` — no `.unwrap()` in production code.

## 3. Code Review
- [ ] Verify orphan branch creation uses an empty parents slice — this is the critical invariant for [2_TAS-REQ-156].
- [ ] Confirm no code path writes to `main` or `HEAD` unless explicitly in an `AutoCollect` context (which is out of scope for this task).
- [ ] Ensure `git2::Signature` uses the canonical `devs <devs@localhost>` author.
- [ ] Check that all `git2` operations propagate errors via `?` — no silent failures.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- checkpoint::branch_policy` (or the actual module path) and ensure all 5 tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` to catch any lint issues.

## 5. Update Documentation
- [ ] Add doc comments to `ensure_checkpoint_branch` and `commit_checkpoint` explaining the orphan branch invariant and the commit message format.
- [ ] Add a `// Covers: 2_TAS-REQ-156` annotation to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- checkpoint::branch_policy --nocapture 2>&1 | grep -c "test result: ok"` and assert the output is `1` (all tests in the module pass).
- [ ] Run `grep -r "Covers: 2_TAS-REQ-156" crates/devs-core/` and assert at least one match exists.
