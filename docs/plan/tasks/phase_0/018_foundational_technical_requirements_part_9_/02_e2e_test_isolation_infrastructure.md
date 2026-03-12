# Task: E2E Test Discovery Isolation (Sub-Epic: 018_Foundational Technical Requirements (Part 9))

## Covered Requirements
- [2_TAS-REQ-002I]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create an integration test (e.g. `tests/e2e_isolation_test.rs`) that starts two simulated server instances in parallel.
- [ ] Mock a server starting (even if just writing to a file).
- [ ] Assert that if `DEVS_DISCOVERY_FILE` is not set uniquely, they would collide (by writing to the same default file).
- [ ] Implement a test that uses a unique temporary path for each instance and verify they don't overwrite each other.

## 2. Task Implementation
- [ ] Create a test helper/fixture (e.g. in `tests/common/discovery.rs` or as a `TestServer` struct).
- [ ] The helper must:
    1. Create a unique temporary directory (using `tempfile`).
    2. Define a unique path for the discovery file inside that directory.
    3. Set the `DEVS_DISCOVERY_FILE` environment variable before spawning a server for the test.
    4. Provide a way for the client to retrieve this path.
- [ ] Ensure that all E2E tests use this helper when starting a server.
- [ ] Verify that the environment variable is scoped to the test or process group.

## 3. Code Review
- [ ] Verify that the isolation prevents discovery file conflicts between parallel server instances in the same test run [2_TAS-REQ-002I].
- [ ] Check for proper cleanup of temporary files and directories.
- [ ] Ensure that the discovery mechanism correctly honors `DEVS_DISCOVERY_FILE`.

## 4. Run Automated Tests to Verify
- [ ] Run the isolation tests: `cargo test --test e2e_isolation_test`.
- [ ] Verify that parallel executions (e.g. using `cargo test --test-threads 4`) work without discovery address collisions.

## 5. Update Documentation
- [ ] Update documentation describing the E2E testing framework's server isolation.
- [ ] Update the `README.md` or a `CONTRIBUTING.md` if test-specific instructions are needed.

## 6. Automated Verification
- [ ] Run `./do test` and confirm 100% coverage for [2_TAS-REQ-002I].
- [ ] Check `target/traceability.json` to ensure the mapping is correct.
