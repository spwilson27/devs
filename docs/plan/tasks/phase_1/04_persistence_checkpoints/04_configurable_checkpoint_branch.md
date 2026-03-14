# Task: Implement Configurable Checkpoint Branch (Working vs Dedicated) (Sub-Epic: 04_Persistence & Checkpoints)

## Covered Requirements
- [1_PRD-REQ-030]

## Dependencies
- depends_on: ["02_atomic_checkpoint_save.md"]
- shared_components: [devs-core (consume), devs-config (consume), devs-checkpoint (own)]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/tests/branch_tests.rs`, write `test_working_branch_commits_to_current_head` that initializes a git repo with a `main` branch, configures `CheckpointBranch::WorkingBranch`, saves a checkpoint, and asserts the new commit is on `main` (the current HEAD branch).
- [ ] Write `test_dedicated_branch_creates_and_commits_to_named_branch` that initializes a git repo on `main`, configures `CheckpointBranch::Dedicated("devs/state".into())`, saves a checkpoint, and asserts: (a) a `devs/state` branch exists, (b) the checkpoint commit is on `devs/state`, (c) `main` is unchanged.
- [ ] Write `test_dedicated_branch_reuses_existing_branch` that creates a `devs/state` branch with an initial commit, saves two checkpoints, and asserts both commits are on the same `devs/state` branch in order.
- [ ] Write `test_dedicated_branch_is_orphan_when_new` that saves a checkpoint with `CheckpointBranch::Dedicated("devs/state".into())` on a fresh repo, and asserts the `devs/state` branch has no parent commit on its first commit (orphan branch).
- [ ] Write `test_checkpoint_branch_isolation` that saves a checkpoint on `devs/state`, then verifies the `.devs/` directory does NOT appear in the `main` branch tree.

## 2. Task Implementation
- [ ] Update `GitCheckpointStore::save_checkpoint` to respect `ProjectRef.checkpoint_branch`:
  - `WorkingBranch`: resolve current HEAD, create commit as child of HEAD, update HEAD.
  - `Dedicated(name)`: look up or create the named branch. If the branch doesn't exist, create it as an orphan (no parent on first commit). Commit checkpoint files to that branch. Do NOT modify HEAD or the working branch.
- [ ] Implement `ensure_branch` helper that either finds an existing branch ref or creates a new orphan branch.
- [ ] Update `snapshot_definition` to also use the configured branch.
- [ ] Ensure branch operations work correctly with bare repos and non-bare repos.

## 3. Code Review
- [ ] Verify working branch mode commits to HEAD's branch, not a hardcoded name.
- [ ] Verify dedicated branch mode creates an orphan branch (no shared history with main).
- [ ] Verify dedicated branch mode never modifies the working branch.
- [ ] Verify branch name from config is used verbatim (no prefixing).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- branch` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-030` to all branch test functions.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-checkpoint` and verify zero failures.
- [ ] Run `cargo clippy -p devs-checkpoint -- -D warnings` and verify zero warnings.
