# Task: Implement MockExecutor Unit Tests (Sub-Epic: 26_Risk 008 Verification)

## Covered Requirements
- [AC-RISK-008-01]

## Dependencies
- depends_on: [none]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create a new unit test file `crates/devs-executor/src/mock_tests.rs` that:
    - Defines a `MockExecutor` using the `mockall` crate.
    - Tests the `prepare` method, mocking success and failure (clone failure).
    - Tests the `collect_artifacts` method, mocking success and failure (artifact collection failure).
    - Tests the `cleanup` method, mocking success and failure (cleanup failure).
    - Ensures tests cover all three `ExecutionEnv` variants (Tempdir, Docker, RemoteSsh) by mocking the returned handles.

## 2. Task Implementation
- [ ] Add `mockall = "0.13"` to `devs-executor` dev-dependencies.
- [ ] Implement `MockExecutor` struct that implements the `StageExecutor` trait using `mockall::automock`.
- [ ] Implement unit tests in `mock_tests.rs`:
    - `test_prepare_success`: Mock `prepare` returning a valid `ExecutionHandle`.
    - `test_prepare_clone_failure`: Mock `prepare` returning `Err(ExecutorError::CloneFailed)`.
    - `test_collect_artifacts_failure`: Mock `collect_artifacts` returning `Err(ExecutorError::CollectionFailed)`.
    - `test_cleanup_failure_logging`: Mock `cleanup` to return an error (or panic) and verify that it is handled (caught) and logged as `WARN` without propagating.
- [ ] Ensure all tests are annotated with `// Covers: AC-RISK-008-01`.

## 3. Code Review
- [ ] Verify that `MockExecutor` correctly implements the `StageExecutor` trait and covers all failure paths as required by `AC-RISK-008-01`.
- [ ] Ensure `mockall` usage is isolated to dev-dependencies and tests.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --lib mock_tests`.

## 5. Update Documentation
- [ ] None.

## 6. Automated Verification
- [ ] Run `./do test` and check for 100% pass in `devs-executor` unit tests.
