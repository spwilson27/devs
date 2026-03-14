# Task: Shared Directory Convention for Inter-Stage Data (Sub-Epic: 03_Data Flow & Stage Communication)

## Covered Requirements
- [1_PRD-REQ-012]

## Dependencies
- depends_on: ["02_context_file_generation.md"]
- shared_components: [devs-executor (consumer — manages working directories), devs-scheduler (consumer — passes working dir config)]

## 1. Initial Test Written
- [ ] Create `devs-executor/tests/shared_directory_tests.rs`.
- [ ] **Test 1: Same working directory across stages.** Two stages in the same workflow with `tempdir` execution target. Assert both stages receive the same working directory path, so files written by Stage A are readable by Stage B.
- [ ] **Test 2: Stage B reads file written by Stage A.** Stage A writes `output.txt` to its working directory. Stage B (depends on A) has the same working dir. Assert `output.txt` exists in Stage B's working directory before agent spawn.
- [ ] **Test 3: Docker execution target preserves shared dir.** When execution target is `docker`, assert the project repo clone directory is consistent across stages within the same run, enabling file-based data sharing.
- [ ] **Test 4: Remote SSH execution target preserves shared dir.** Same assertion for `remote` execution target — the repo clone path on the remote machine is reused across stages.
- [ ] **Test 5: Isolated runs do not share directories.** Two concurrent runs of the same workflow get different working directories. Assert files from Run 1 are not visible to Run 2.
- [ ] Annotate all tests with `// Covers: 1_PRD-REQ-012`.

## 2. Task Implementation
- [ ] In `devs-executor/src/environment.rs`, ensure `prepare_environment` for a given `(ProjectRef, RunId)` returns a deterministic working directory path. If the directory already exists (from a prior stage in the same run), reuse it rather than cloning again.
- [ ] Add a `WorkingDirRegistry` (or simple `HashMap<RunId, PathBuf>`) in the executor to track active working directories per run. On first stage of a run, clone the repo. On subsequent stages, return the existing path.
- [ ] For `docker` target: ensure the container mount path is consistent per run. Use a named volume or bind mount keyed by `RunId`.
- [ ] For `remote` target: ensure the remote clone path is deterministic per run (e.g., `/tmp/devs/<run_id>/`).
- [ ] On run completion or cancellation, clean up the working directory via `cleanup(env)`.
- [ ] Ensure the working directory path is passed through to the `AgentInvocation` so the agent process CWD is set correctly.

## 3. Code Review
- [ ] Verify run isolation: concurrent runs MUST NOT share working directories.
- [ ] Verify cleanup occurs on both success and failure paths (no leaked temp dirs).
- [ ] Confirm the `WorkingDirRegistry` is behind `Arc<RwLock<...>>` if accessed from multiple tasks, following the project's lock acquisition order convention.
- [ ] No path traversal vulnerabilities: `RunId` used in paths must be sanitized (UUID format guarantees this).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --test shared_directory_tests`.
- [ ] All 5 tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `WorkingDirRegistry` and the reuse logic explaining the shared directory convention.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero regressions.
- [ ] Run `grep -r 'Covers: 1_PRD-REQ-012' devs-executor/tests/shared_directory_tests.rs` and confirm at least 5 matches.
