# Task: Verify E2E Test Isolation Infrastructure (Sub-Epic: 069_Detailed Domain Specifications (Part 34))

## Covered Requirements
- [2_TAS-REQ-424]

## Dependencies
- depends_on: [none]
- shared_components: [devs-server, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new E2E test file `tests/e2e/test_isolation.rs`.
- [ ] Write a test `test_parallel_server_isolation` that:
  - Spawns two server instances in parallel.
  - Assigns each instance a unique temporary directory and a distinct `DEVS_DISCOVERY_FILE` path.
  - Verifies that both servers start successfully and bind to different available ports.
  - Asserts that the first server's address is ONLY present in its discovery file and NOT the second server's discovery file.
  - Asserts that both discovery files coexist and contain correct, distinct addresses.
  - Verifies that connecting to server 1's gRPC port using its discovery file works and does not interfere with server 2.

## 2. Task Implementation
- [ ] Implement the `DEVS_DISCOVERY_FILE` environment variable support in the server (Step 9 of [2_TAS-REQ-001]).
- [ ] Update the E2E test helper utility to automatically generate unique discovery file paths and manage server life cycles ([2_TAS-REQ-002I]).
- [ ] Ensure the server chooses dynamic available ports if none are configured, or uses different ports for parallel tests.

## 3. Code Review
- [ ] Verify that the `DEVS_DISCOVERY_FILE` precedence is correctly implemented ([2_TAS-REQ-002E]).
- [ ] Ensure that no other resources (e.g. well-known config paths) are shared between the parallel instances in a way that causes interference.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test --test e2e::test_isolation`.
- [ ] Run the E2E test suite in parallel using `cargo test --workspace` and verify that no tests fail due to port or discovery file contention.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that E2E test isolation infrastructure has been verified.

## 6. Automated Verification
- [ ] Verify traceability by running `./do test` and checking `target/traceability.json` for coverage of [2_TAS-REQ-424].
