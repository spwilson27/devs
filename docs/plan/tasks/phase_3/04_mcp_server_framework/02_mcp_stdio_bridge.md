# Task: MCP Stdio Bridge Implementation (Sub-Epic: 04_MCP Server Framework)

## Covered Requirements
- [2_TAS-REQ-048], [3_MCP_DESIGN-REQ-057]

## Dependencies
- depends_on: [01_mcp_server_foundation.md]
- shared_components: [devs-grpc]

## 1. Initial Test Written
- [ ] Create a new unit test in `crates/devs-mcp-bridge/src/main.rs` that mocks the `stdout` and `stderr` and verifies the bridge's ability to handle multi-line JSON input.
- [ ] Test the bridge's reconnection logic by mocking an HTTP server that drops the connection and verifying that the bridge attempts one reconnection after 1 second.
- [ ] Test that the bridge correctly reports a fatal error and exits with code 1 after a failed reconnection attempt.
- [ ] // Covers: [3_MCP_DESIGN-REQ-057]

## 2. Task Implementation
- [ ] Create a new crate `devs-mcp-bridge` (a standalone binary).
- [ ] Implement a loop that reads complete JSON objects from `stdin`, terminated by `\n`.
- [ ] Buffer partial lines until a `\n` is received.
- [ ] Limit the line length to 1 MiB and reject lines exceeding this limit with a structured JSON-RPC error.
- [ ] Use the `devs-grpc` discovery logic to find the `devs` server's HTTP MCP address.
- [ ] For each incoming `stdin` request, forward it as a POST request to the server's `/mcp/v1/call` endpoint.
- [ ] Write the server's response back to `stdout` as a single line terminated by `\n`.
- [ ] Implement the 1-second reconnection attempt on connection loss to the HTTP server.
- [ ] Ensure that the bridge exits with code 1 if the reconnection fails.
- [ ] // Covers: [2_TAS-REQ-048]

## 3. Code Review
- [ ] Verify that the bridge maintains the HTTP connection for its lifetime instead of rediscovering on each request.
- [ ] Ensure that `stdin` and `stdout` are handled efficiently to minimize latency.
- [ ] Confirm that all bridge errors are emitted as structured JSON objects on `stdout`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp-bridge`.
- [ ] Run an E2E test where the `devs-mcp-bridge` is started and commands are piped into it to interact with a running `devs` server.

## 5. Update Documentation
- [ ] Update any developer documentation to explain how to use the bridge for stdio-only MCP clients (e.g., Claude Code).

## 6. Automated Verification
- [ ] Run `./do test` and verify that the traceability report shows 100% coverage for the mapped requirements.
