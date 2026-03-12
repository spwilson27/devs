# Task: Implement Auto-Collect for DockerExecutor (Sub-Epic: 09_Artifact Collection)

## Covered Requirements
- [2_TAS-REQ-044]

## Dependencies
- depends_on: [01_define_artifact_collection_strategy_schema.md, 02_implement_local_auto_collect.md]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-executor/src/docker.rs` (or equivalent) that:
    - Starts a mock container with a git repository inside `/workspace/repo/`.
    - Modifies a file inside the container via `docker exec`.
    - Calls `collect_artifacts` on the `DockerExecutor`.
    - Verifies that `docker exec` was called to run `git add -A`, `git commit ...`, and `git push ...` inside the container.
    - Verifies the commit message and branch target.

## 2. Task Implementation
- [ ] Implement `DockerExecutor::collect_artifacts`:
    - Check if `policy` is `AutoCollect`.
    - If so, use `bollard` (or current Docker API) to run `docker exec` in the container.
    - Execute the same git sequence as the `git_auto_collect` helper, but inside the container environment:
        1. `git diff --quiet`
        2. `git add -A`
        3. `git commit -m "devs: auto-collect stage <stage_name> run <run_id>"`
        4. `git push origin HEAD:<checkpoint_branch>`
- [ ] Ensure the git commands run in the `/workspace/repo/` directory inside the container.
- [ ] Log any errors from the `docker exec` calls at the appropriate level.

## 3. Code Review
- [ ] Verify that `git push` inside the container will use the container's git credentials or that `devs` handles git authentication for the container.
- [ ] Ensure that no-op collection doesn't cause a failure.
- [ ] Verify that the container ID is correctly retrieved from the `ExecutionHandle`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --lib docker`.

## 5. Update Documentation
- [ ] Update `GEMINI.md` memory to reflect that `DockerExecutor` now supports auto-collection.

## 6. Automated Verification
- [ ] Run `./do test` and check for successful execution logs of `docker exec` git commands.
