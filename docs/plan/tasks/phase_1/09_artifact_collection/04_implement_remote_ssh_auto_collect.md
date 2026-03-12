# Task: Implement Auto-Collect for RemoteSshExecutor (Sub-Epic: 09_Artifact Collection)

## Covered Requirements
- [2_TAS-REQ-044]

## Dependencies
- depends_on: [01_define_artifact_collection_strategy_schema.md, 02_implement_local_auto_collect.md]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-executor/src/remote.rs` (or equivalent) that:
    - Mocks an SSH server (using `ssh2` mock or equivalent).
    - Mocks the project repo in `~/devs-runs/<run-id>-<stage-name>/repo/`.
    - Modifies a file inside the repo.
    - Calls `collect_artifacts` on the `RemoteSshExecutor`.
    - Verifies that the git sequence was executed via SSH channels.
    - Verifies the commit message and branch target.

## 2. Task Implementation
- [ ] Implement `RemoteSshExecutor::collect_artifacts`:
    - Check if `policy` is `AutoCollect`.
    - If so, use the SSH session from the `ExecutionHandle` (retrieved from `any_state`).
    - Open an SSH channel and execute the git sequence:
        1. `cd ~/devs-runs/<run-id>-<stage-name>/repo/`
        2. `git diff --quiet || (git add -A && git commit -m "devs: auto-collect stage <stage_name> run <run_id>" && git push origin HEAD:<checkpoint_branch>)`
- [ ] Ensure that the git commands are correctly escaped and executed on the remote host.
- [ ] Handle any SSH connection failures during collection by returning an appropriate error.

## 3. Code Review
- [ ] Verify that the `RemoteSshExecutor` uses the `checkpoint_branch` from the `StageContext`.
- [ ] Ensure that no-op collection doesn't cause a failure.
- [ ] Confirm that SSH channels are correctly closed after execution.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --lib remote`.

## 5. Update Documentation
- [ ] Update `GEMINI.md` memory to reflect that `RemoteSshExecutor` now supports auto-collection.

## 6. Automated Verification
- [ ] Run `./do test` and check for successful execution logs of SSH git commands.
