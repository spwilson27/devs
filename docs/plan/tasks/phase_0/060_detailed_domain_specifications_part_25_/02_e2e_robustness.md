# Task: Reliable E2E Test Execution Infrastructure (Sub-Epic: 060_Detailed Domain Specifications (Part 25))

## Covered Requirements
- [2_TAS-REQ-255], [2_TAS-REQ-256]

## Dependencies
- depends_on: [none]
- shared_components: ["Traceability & Verification Infrastructure"]

## 1. Initial Test Written
- [ ] Create a unit test for a new `TestServer` or `E2EFixture` utility that verifies:
  - Spawning the fixture results in a server binding to a non-zero port that was originally requested as port 0.
  - Dropping the fixture terminates the server subprocess.
- [ ] Verify that a second instance of the fixture correctly binds to a DIFFERENT random port to avoid address conflicts.

## 2. Task Implementation
- [ ] In a shared testing utility location (e.g., `crates/devs-core/src/test_utils.rs` or a dedicated `crates/devs-test-utils`), implement a `TestServer` struct.
- [ ] Use `std::net::TcpListener::bind("127.0.0.1:0")` to obtain an OS-assigned random port.
- [ ] Update the server startup code (or a mock version for this foundation task) to accept a port override.
- [ ] Ensure the `TestServer` implements `Drop` or uses a mechanism (like `assert_cmd`'s `child` wrapper) that ensures `SIGKILL` or `SIGTERM` is sent to the process when it goes out of scope.
- [ ] Configure `DEVS_DISCOVERY_FILE` for each test instance to a unique temporary file path.

## 3. Code Review
- [ ] Verify that the implementation prevents "hanging" tests that would otherwise block CI runners.
- [ ] Confirm that parallel E2E tests will not fail due to `EADDRINUSE` by using port 0.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test` in the crate containing the test utilities.
- [ ] Confirm that all tests pass and that no zombie processes remain after completion.

## 5. Update Documentation
- [ ] Update `MEMORY.md` to document the correct way to write E2E tests using the new random-port and auto-cleanup fixture.

## 6. Automated Verification
- [ ] Run a small loop of the E2E infrastructure test (e.g., 10 iterations) to ensure no port collision or cleanup failures occur in parallel-like scenarios.
