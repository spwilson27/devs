# Task: E2E Test Isolation via DEVS_DISCOVERY_FILE (Sub-Epic: 069_Detailed Domain Specifications (Part 34))

## Covered Requirements
- [2_TAS-REQ-424]

## Dependencies
- depends_on: ["01_discovery_based_cli_connection.md"]
- shared_components: [Server Discovery Protocol, devs-server]

## 1. Initial Test Written
- [ ] Create an E2E test (e.g., `e2e_test_isolation.rs`) that:
  1. Creates two unique temp file paths: `discovery_a` and `discovery_b`.
  2. Starts server A with `DEVS_DISCOVERY_FILE=discovery_a` on a random available port.
  3. Starts server B with `DEVS_DISCOVERY_FILE=discovery_b` on a different random available port.
  4. Waits for both discovery files to appear.
  5. Reads `discovery_a` and asserts it contains server A's port (not server B's).
  6. Reads `discovery_b` and asserts it contains server B's port (not server A's).
  7. Runs `devs list` with `DEVS_DISCOVERY_FILE=discovery_a` and asserts it connects to server A (exit 0).
  8. Runs `devs list` with `DEVS_DISCOVERY_FILE=discovery_b` and asserts it connects to server B (exit 0).
  9. Shuts down both servers and cleans up.
- [ ] Add `// Covers: 2_TAS-REQ-424` annotation to the test function.

## 2. Task Implementation
- [ ] Ensure the server reads `DEVS_DISCOVERY_FILE` env var at startup and uses it as the discovery file path (instead of the default `~/.config/devs/server.addr`).
- [ ] Ensure the CLI reads `DEVS_DISCOVERY_FILE` env var when resolving the discovery file path.
- [ ] Ensure the server binds to port 0 (or a configurable port) so parallel instances don't conflict.
- [ ] Verify that each server writes only its own address to its own discovery file — no shared global state between instances.

## 3. Code Review
- [ ] Verify `DEVS_DISCOVERY_FILE` is respected by both server and client code paths.
- [ ] Verify no global/static mutable state that could leak between parallel server instances in the same process (if running in-process tests).
- [ ] Verify the test does not depend on timing — use polling with timeout rather than fixed sleeps.

## 4. Run Automated Tests to Verify
- [ ] Run the isolation test and confirm it passes.
- [ ] Run it concurrently with other E2E tests (`cargo test --test ...`) to verify no cross-contamination.
- [ ] Run `./do test` and confirm no regressions.

## 5. Update Documentation
- [ ] Document `DEVS_DISCOVERY_FILE` env var in the server and CLI doc comments as the mechanism for E2E test isolation.

## 6. Automated Verification
- [ ] Run `./do presubmit` and confirm exit 0.
- [ ] Verify `// Covers: 2_TAS-REQ-424` appears via `grep -r "Covers: 2_TAS-REQ-424" tests/`.
