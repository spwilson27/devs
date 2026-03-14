# Task: Agent-to-Server MCP Communication Contract (Sub-Epic: 066_Detailed Domain Specifications (Part 31))

## Covered Requirements
- [2_TAS-REQ-408]

## Dependencies
- depends_on: []
- shared_components: ["devs-adapters", "devs-core"]

## 1. Initial Test Written
- [ ] Write a unit test `test_agent_invocation_includes_devs_mcp_addr` that creates an `AgentInvocation` and asserts the environment variables map includes `DEVS_MCP_ADDR` set to the server's MCP address (e.g., `127.0.0.1:9100`).
- [ ] Write a unit test `test_agent_env_has_no_grpc_addr` that creates an `AgentInvocation` and asserts no `DEVS_GRPC_ADDR` or similar gRPC address variable is injected — agents communicate only via MCP, not gRPC.
- [ ] Write a unit test `test_devs_mcp_addr_format` that asserts the value of `DEVS_MCP_ADDR` is a valid `host:port` string (parseable as `SocketAddr`).
- [ ] Write an architecture fitness test `test_agents_do_not_contact_clients` that scans adapter code for any mechanism where agents send data directly to CLI/TUI client binaries and asserts zero matches.

## 2. Task Implementation
- [ ] In the adapter layer's agent spawning logic, ensure `DEVS_MCP_ADDR` is always injected into the agent subprocess environment, set to the server's MCP listen address.
- [ ] Ensure no gRPC address is injected into agent environments — agents must use MCP exclusively.
- [ ] Add doc comment: "Agent subprocesses communicate with devs exclusively via the MCP port using DEVS_MCP_ADDR. Agents do not communicate with client binaries directly (2_TAS-REQ-408)."
- [ ] Add `// Covers: 2_TAS-REQ-408` annotations to each test.

## 3. Code Review
- [ ] Verify `DEVS_MCP_ADDR` injection is present in all adapter spawn paths (Claude, Gemini, OpenCode, Qwen, Copilot).
- [ ] Verify no direct agent-to-client communication path exists.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters -- mcp_addr` and `cargo test -- agent_invocation`. Confirm all pass.

## 5. Update Documentation
- [ ] Document `DEVS_MCP_ADDR` in the adapter module's public API docs.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures. Grep test output for the new test names.
