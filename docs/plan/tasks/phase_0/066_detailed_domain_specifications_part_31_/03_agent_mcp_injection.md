# Task: Agent-to-Server MCP Injection (Sub-Epic: 066_Detailed Domain Specifications (Part 31))

## Covered Requirements
- [2_TAS-REQ-408]

## Dependencies
- depends_on: [01_grpc_mcp_discovery.md]
- shared_components: [devs-adapters, devs-server]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-adapters` that mocks the `AgentAdapter` and verifies `DEVS_MCP_ADDR` is present in the `Command` before spawning.
- [ ] Write an integration test where a mock agent subprocess (a simple script) is spawned and it reports its environment to the server via the MCP port.
- [ ] Assert that the agent can connect to the MCP server but does not talk to any client binaries.

## 2. Task Implementation
- [ ] Update the `AgentAdapter` trait and implementations in `devs-adapters` to include the logic for injecting `DEVS_MCP_ADDR` into the environment of the spawned subprocess.
- [ ] Use the MCP port discovered in Task 1 to construct the full `DEVS_MCP_ADDR` string (e.g. `http://127.0.0.1:7891/mcp/v1/call`).
- [ ] Ensure that agents do not have any reference to client binaries like `devs-cli` or `devs-tui` in their environment or prompts for communication.

## 3. Code Review
- [ ] Confirm that `DEVS_MCP_ADDR` is correctly formatted and that the endpoint matches the server's MCP handler.
- [ ] Verify that the adapter properly cleans up any environment variables that shouldn't be shared with the agent (e.g. server-internal configuration).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters`.
- [ ] Verify the environment injection tests pass.

## 5. Update Documentation
- [ ] Update the `Agent Interaction` section of the project docs to clarify the use of `DEVS_MCP_ADDR` for mid-run communication.

## 6. Automated Verification
- [ ] Run `./do test` and check `target/traceability.json` for `2_TAS-REQ-408`.
