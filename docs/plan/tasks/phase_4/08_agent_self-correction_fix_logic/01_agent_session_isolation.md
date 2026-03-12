# Task: Implement Agent Session Isolation and Discovery Protocol (Sub-Epic: 08_Agent Self-Correction & Fix Logic)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-003], [3_MCP_DESIGN-REQ-BR-008]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Write E2E tests in `crates/devs-cli/tests/agent_session_tests.rs` that:
    1. Verify that `devs` agent (or orchestrator) generates a valid UUIDv4 session ID at startup.
    2. Verify that if `DEVS_DISCOVERY_FILE` is set in the environment, the agent reads only that file and ignores the default `~/.config/devs/server.addr`.
    3. Simulate a parallel execution environment and verify that two agents with different `DEVS_DISCOVERY_FILE` paths connect to their respective servers without address collision.
    4. Verify that the session ID remains stable after a simulated process interruption and restart (by reading the persisted session state).

## 2. Task Implementation
- [ ] Implement UUIDv4 session ID generation in the agent's startup routine (e.g., in `crates/devs-cli/src/agent/mod.rs` or a dedicated session module).
- [ ] Update the server discovery logic in `crates/devs-grpc/src/discovery.rs` to prioritize the `DEVS_DISCOVERY_FILE` environment variable.
- [ ] Ensure that the session ID is used to create an isolated directory under `.devs/agent-state/<session-id>/` for persisting `task_state.json` (per REQ-BR-008).
- [ ] Implement logic to detect an existing `task_state.json` and resume the session using the same ID if a recovery is detected.

## 3. Code Review
- [ ] Verify that no default discovery path is used if `DEVS_DISCOVERY_FILE` is set but points to a missing file (should fail with a clear error).
- [ ] Ensure UUID generation uses a cryptographically secure RNG.
- [ ] Confirm that the session ID is passed to all downstream orchestrated tasks.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test agent_session_tests` to verify isolation and session stability.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` to clarify that `DEVS_DISCOVERY_FILE` is the mandatory isolation mechanism for E2E tests.

## 6. Automated Verification
- [ ] Run `./do test --package devs-cli` and ensure 100% pass rate.
