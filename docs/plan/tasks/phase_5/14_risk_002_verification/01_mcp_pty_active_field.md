# Task: Verify MCP `get_pool_state` PTY Activation Status Field (Sub-Epic: 14_Risk 002 Verification)

## Covered Requirements
- [RISK-002-BR-003], [AC-RISK-002-02]

## Dependencies
- depends_on: []
- shared_components: [devs-mcp, devs-pool, devs-proto]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-mcp/tests/pool_state_test.rs` that starts a mock MCP server.
- [ ] The test must simulate a PTY-unavailable state (e.g., by overriding the internal PTY probe result if possible, or mocking the adapter behavior).
- [ ] Call the `get_pool_state` MCP tool.
- [ ] Verify that the response contains a `pty_active` boolean field for each agent in the pool.
- [ ] Assert that `pty_active` is `false` when the agent is running in a PTY-fallback scenario (capability unavailable but configured).
- [ ] Assert that `pty_active` is `true` only when both `PTY_AVAILABLE` is true AND the agent/stage config enables PTY.

## 2. Task Implementation
- [ ] Ensure `devs-proto` definitions for `AgentState` or equivalent include the `pty_active` field.
- [ ] Update `devs-pool`'s `AgentState` or `PoolState` structure to include the runtime PTY activation status.
- [ ] Update the `get_pool_state` handler in `devs-mcp` to populate this field using the state from `devs-pool`.
- [ ] The logic for populating `pty_active` must be `PTY_AVAILABLE && agent.pty_config` (or the actual spawned state if available).

## 3. Code Review
- [ ] Verify that the `pty_active` field is present in the response even when its value is `false`.
- [ ] Ensure no PTY allocation is actually attempted during the MCP call; it must read from the current pool state.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test pool_state_test`.
- [ ] Run `./do coverage` to ensure the new field and logic are covered.

## 5. Update Documentation
- [ ] Update any MCP API documentation to include the `pty_active` field in the `get_pool_state` response schema.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to confirm [RISK-002-BR-003] and [AC-RISK-002-02] are mapped to the new test.
