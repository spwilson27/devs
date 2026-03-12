# Task: Configure E2E Test Concurrency and Unique Discovery Environments (Sub-Epic: 33_Risk 011 Verification)

## Covered Requirements
- [RISK-011-BR-003], [RISK-011-BR-004], [MIT-011]

## Dependencies
- depends_on: [01_server_handle_shutdown.md]
- shared_components: [devs-grpc]

## 1. Initial Test Written
- [ ] Create a test in `devs-grpc/tests/server_discovery.rs` (or equivalent) that:
    - Spawns a test server using the standard `start_server` helper.
    - Asserts that `DEVS_DISCOVERY_FILE` is set in the process's environment.
    - Asserts that the path of the discovery file is located inside a `TempDir` created specifically for that test.
    - Verifies that two concurrent `start_server` calls (if manually invoked in a thread-safe way) would produce distinct discovery file paths.

## 2. Task Implementation
- [ ] In `.cargo/config.toml` (or appropriate cargo configuration for E2E test targets), set `test-threads = 1` for all E2E test binaries.
    - Ensure this is correctly scoped to `[target.'cfg(all())']` or specific test targets to avoid slowing down unit tests.
- [ ] In `devs-grpc/src/test_util.rs` (or equivalent), update `start_server` to:
    - Use `tempfile::TempDir::new()` to create a unique temporary directory for each invocation.
    - Construct a path for `server.addr` inside that `TempDir`.
    - Set the `DEVS_DISCOVERY_FILE` environment variable for the server process to this unique path.
    - Store the `TempDir` handle inside the returned `ServerHandle` to ensure the directory is cleaned up when the `ServerHandle` is dropped.
- [ ] Confirm that `ServerHandle`'s gRPC client (the one used by the test) is configured to use the same `DEVS_DISCOVERY_FILE` for its auto-discovery.

## 3. Code Review
- [ ] Verify that `test-threads = 1` is applied to all E2E tests in the workspace.
- [ ] Check that `DEVS_DISCOVERY_FILE` is not hardcoded anywhere in the test suite.
- [ ] Ensure that `ServerHandle` owns the `TempDir` and it's dropped only after the process has exited.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and monitor output for any signs of `EADDRINUSE`.
- [ ] Run `cargo test --test '*' -- --show-output` for E2E tests and verify each test uses a unique temp path for its discovery file.

## 5. Update Documentation
- [ ] Update documentation on `E2E Test Infrastructure` to reflect the requirement of `test-threads = 1` and unique `DEVS_DISCOVERY_FILE` paths.

## 6. Automated Verification
- [ ] Run `grep -r "test-threads = 1" .cargo/config.toml` to verify concurrency is restricted.
- [ ] Run a grep search for `/tmp/devs-test.addr` or other hardcoded paths to ensure none remain in the codebase.
