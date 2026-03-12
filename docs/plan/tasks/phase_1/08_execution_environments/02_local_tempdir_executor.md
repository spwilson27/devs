# Task: Implement LocalTempDirExecutor (Sub-Epic: 08_Execution Environments)

## Covered Requirements
- [2_TAS-REQ-041], [2_TAS-REQ-042], [2_TAS-REQ-043]

## Dependencies
- depends_on: [01_executor_trait.md]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create a test in `devs-executor/src/local_tempdir.rs` (or equivalent) that:
    - Calls `prepare` on a `LocalTempDirExecutor`.
    - Verifies that the clone path matches `<os-tempdir>/devs-<run-id>-<stage-name>/repo/`.
    - Verifies that a shallow clone (`--depth 1`) is performed by default.
    - Verifies that `cleanup` removes the entire directory.
- [ ] Write a test to ensure that cleanup occurs even if a failure happens during stage execution (simulated).

## 2. Task Implementation
- [ ] Implement `LocalTempDirExecutor` struct.
- [ ] Implement `prepare` method:
    - Create a unique directory using `std::env::temp_dir()`.
    - The path MUST be `<os-tempdir>/devs-<run-id>-<stage-name>/repo/`.
    - Execute `git clone <repo_url> <target_path>`.
    - Use `--depth 1` unless `full_clone` is `true`.
- [ ] Implement `cleanup` method:
    - Use `std::fs::remove_dir_all` to delete the `<os-tempdir>/devs-<run-id>-<stage-name>/` directory.
    - Cleanup failures MUST be logged at `WARN` level and MUST NOT return an error (as per `2_TAS-REQ-043`).
- [ ] Implement `collect_artifacts` (can be a no-op for now or a simple stub, as artifact collection is sub-epic 09).

## 3. Code Review
- [ ] Verify clone path structure against `2_TAS-REQ-041`.
- [ ] Verify shallow clone logic against `2_TAS-REQ-042`.
- [ ] Verify cleanup robustness and logging against `2_TAS-REQ-043`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --lib local_tempdir` to verify the implementation.

## 5. Update Documentation
- [ ] Update `GEMINI.md` memory to reflect the implementation of `LocalTempDirExecutor`.

## 6. Automated Verification
- [ ] Run `./do test` and check the test output for successful directory creation and deletion.
