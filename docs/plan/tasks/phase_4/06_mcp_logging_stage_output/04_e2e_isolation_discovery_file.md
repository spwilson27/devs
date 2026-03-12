# Task: E2E Observability: Isolation and Startup Diagnostics (Sub-Epic: 06_MCP Logging & Stage Output)

## Covered Requirements
- [3_MCP_DESIGN-REQ-040]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc, devs-server, tests]

## 1. Initial Test Written
- [ ] Create an E2E test in `tests/isolation_test.rs` that purposefully attempts to start two server instances.
- [ ] The test MUST:
  - Verify that each instance is configured with a unique `DEVS_DISCOVERY_FILE` environment variable.
  - Assert that both instances start successfully and don't overwrite each other's discovery information.
- [ ] Create a "broken config" test in `tests/startup_failure_test.rs`.
- [ ] The test MUST:
  - Simulate a server startup failure (e.g., due to an invalid port or missing config).
  - Assert that the test harness/agent detects the missing discovery file.
  - Verify that the agent (or harness) calls `get_stage_output` to read the server's `stderr`.
  - Assert that the resulting output contains the expected "invalid config" or "bind error" message.

## 2. Task Implementation
- [ ] Update the `TestHarness` in `tests/common/mod.rs` (or equivalent) to:
  - Automatically generate a unique temporary path for `DEVS_DISCOVERY_FILE` for every test case.
  - Ensure the environment variable is passed to the spawned `devs-server`.
- [ ] Implement the diagnostic protocol in the test runner or agent logic:
  - Wait for the discovery file with a timeout.
  - If the timeout is reached, treat it as a "Startup Failure".
  - Automatically fetch the `stderr` of the startup stage (or the process logs) via MCP (if the server is still reachable) or direct filesystem read (if not).
  - Use `get_stage_output` as the primary tool for this classification (REQ-040).

## 3. Code Review
- [ ] Verify that every E2E test case uses a unique discovery file path (REQ-040).
- [ ] Ensure that `DEVS_DISCOVERY_FILE` is used as the primary mechanism for client-server discovery in tests.
- [ ] Validate that startup failures are not ignored and lead to a clear diagnostic log.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test isolation_test`.
- [ ] Run `cargo test --test startup_failure_test`.
- [ ] Confirm that process isolation is maintained and failures are correctly diagnosed.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/2_tas.md` or `3_mcp_design.md` with the discovery isolation protocol for E2E tests.
- [ ] Update the AI agent's memory to always check discovery and logs during startup failures.

## 6. Automated Verification
- [ ] Run `./do test` to verify traceability for [3_MCP_DESIGN-REQ-040].
