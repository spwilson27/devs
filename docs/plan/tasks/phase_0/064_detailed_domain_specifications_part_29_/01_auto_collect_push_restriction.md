# Task: Auto-Collect Push Restriction to Checkpoint Branch Only (Sub-Epic: 064_Detailed Domain Specifications (Part 29))

## Covered Requirements
- [2_TAS-REQ-283]

## Dependencies
- depends_on: []
- shared_components: ["devs-executor", "devs-checkpoint"]

## 1. Initial Test Written
- [ ] In `crates/devs-executor/src/artifact.rs` (or equivalent artifact-collection module), write a unit test `test_auto_collect_pushes_only_to_checkpoint_branch` that:
  1. Creates a mock git repository with two branches: a working branch (`main`) and a checkpoint branch (`devs/state`).
  2. Configures `ArtifactCollection::AutoCollect` with `checkpoint_branch = "devs/state"`.
  3. Calls the auto-collect function and asserts that the push target is exactly `devs/state`.
- [ ] Write a unit test `test_auto_collect_rejects_push_to_non_checkpoint_branch` that:
  1. Attempts to invoke auto-collect with a push target different from the configured checkpoint branch.
  2. Asserts the operation returns an error or is prevented at the type level.
- [ ] Write a unit test `test_auto_collect_never_pushes_to_working_branch` that:
  1. Sets the working branch to `main` and checkpoint branch to `devs/state`.
  2. Runs auto-collect and asserts no push operation targets `main`.

## 2. Task Implementation
- [ ] In the artifact collection module, add a guard in the `AutoCollect` code path that extracts the configured checkpoint branch from the project configuration.
- [ ] Before any `git push` operation, validate that the target ref matches the checkpoint branch exactly. If it does not, return an error: `"AutoCollect may only push to the checkpoint branch '{branch}', refusing to push to '{target}'"`.
- [ ] Ensure the `AgentDriven` artifact mode is unaffected by this restriction (agents manage their own pushes).

## 3. Code Review
- [ ] Verify that no code path in `AutoCollect` can push to an arbitrary branch — the checkpoint branch must be the sole target.
- [ ] Confirm the restriction is enforced at the point of push, not just at configuration time.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor -- auto_collect` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add a doc comment on the push-guard function explaining the security rationale (preventing accidental pushes to project branches).

## 6. Automated Verification
- [ ] Run `cargo test -p devs-executor` and verify exit code 0 with no failures.
