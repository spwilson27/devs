# Task: Create devs-test-helper and Implement ServerHandle lifecycle (Sub-Epic: 34_Risk 011 Verification)

## Covered Requirements
- [AC-RISK-011-03], [AC-RISK-011-04]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Write a test in `crates/devs-test-helper/tests/lifecycle.rs` that:
    - Creates a `TestServerConfig` with a `temp_dir`.
    - Spawns a dummy process (e.g., `sleep 100`) as if it were the server.
    - Wraps it in a `ServerHandle`.
    - Drops the `ServerHandle`.
    - Verifies that the process is terminated immediately.
    - Verifies that `drop()` blocks until the process has truly exited (e.g., by checking the process state or attempting to bind to a port it was using).
- [ ] Write a test that verifies `ServerHandle::drop()` sends SIGTERM first, waits, and then sends SIGKILL if the process persists (can be simulated with a process that ignores SIGTERM).

## 2. Task Implementation
- [ ] Create `crates/devs-test-helper` crate.
- [ ] Implement `TestServerConfig` struct:
    ```rust
    pub struct TestServerConfig {
        pub temp_dir: tempfile::TempDir,
        // other fields as needed
    }
    impl TestServerConfig {
        pub fn new() -> Self {
            let temp_dir = tempfile::tempdir().expect("Failed to create TempDir");
            Self { temp_dir }
        }
    }
    ```
- [ ] Implement `ServerHandle` struct and `start_server(config: TestServerConfig) -> ServerHandle`.
- [ ] Implement `Drop` for `ServerHandle`:
    - Send `SIGTERM` (on Unix) or terminate (on Windows).
    - Use `wait_timeout` to wait up to 10 seconds.
    - If timeout expires, send `SIGKILL`.
    - Call `wait()` to ensure the zombie process is reaped and the process has fully exited.

## 3. Code Review
- [ ] Verify that `start_server` enforces uniqueness of the discovery file by using the provided `temp_dir`.
- [ ] Verify that `ServerHandle` does not leak processes even if the test panics (RAII).
- [ ] Verify that the implementation handles platform differences (SIGTERM/SIGKILL on Unix, equivalent on Windows).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-test-helper`.
- [ ] Verify that the port reuse test succeeds immediately after drop.

## 5. Update Documentation
- [ ] Add doc comments to `ServerHandle` and `start_server`.
- [ ] Update `devs-test-helper/README.md` with usage examples for E2E tests.

## 6. Automated Verification
- [ ] Verify requirement traceability: `// Covers: AC-RISK-011-03, AC-RISK-011-04`.
- [ ] Run `./do presubmit` to ensure no regressions.
