# Task: MCP Stdio Bridge Binary (Sub-Epic: 04_MCP Server Framework)

## Covered Requirements
- [1_PRD-REQ-040], [3_MCP_DESIGN-REQ-057], [3_MCP_DESIGN-REQ-SRV-002]

## Dependencies
- depends_on: ["01_mcp_crate_scaffold_and_jsonrpc_server.md"]
- shared_components: ["Server Discovery Protocol (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp-bridge/tests/bridge_tests.rs`
- [ ] Write `test_bridge_forwards_stdin_to_mcp_server` that starts an MCP server on an ephemeral port, launches the bridge binary pointing at that port, writes a JSON-RPC request to the bridge's stdin, and asserts the bridge's stdout contains the server's response
- [ ] Write `test_bridge_forwards_response_to_stdout` that sends a valid `list_runs` request through the bridge and asserts the stdout output is valid JSON-RPC with `"result"` and `"error"` fields
- [ ] Write `test_bridge_connection_loss_reconnect_success` that starts an MCP server, launches the bridge, kills the server, restarts it within 1 second, and verifies the bridge reconnects and continues forwarding
- [ ] Write `test_bridge_connection_loss_reconnect_failure` that starts the bridge pointing at a port with no server, waits for the reconnect attempt, and asserts stdout contains `{"result": null, "error": "internal: server connection lost", "fatal": true}` and the process exits with code 1
- [ ] Write `test_bridge_exit_code_on_connection_loss` that verifies the bridge exits with code 1 after failed reconnection
- [ ] Write `test_bridge_no_dropped_inflight_requests` that sends a request, kills the server before response arrives, and asserts the bridge outputs an error response for that request (not silence)
- [ ] Write `test_bridge_reads_discovery_file` that writes a discovery file with a server address, launches the bridge without explicit `--server` flag, and verifies it connects to the discovered address
- [ ] Write `test_bridge_explicit_server_overrides_discovery` that writes a discovery file with one address but passes `--server` with a different address, and verifies the bridge connects to the explicit address

## 2. Task Implementation
- [ ] Add `devs-mcp-bridge` crate to the Cargo workspace as a `[[bin]]` target with dependencies: `tokio`, `reqwest` (HTTP client), `serde`, `serde_json`, `tracing`, `clap`
- [ ] Implement `crates/devs-mcp-bridge/src/main.rs` with CLI parsing: `--server <host:port>` optional flag
- [ ] Implement server address resolution: if `--server` provided, use it; otherwise read from discovery file (`DEVS_DISCOVERY_FILE` env var or `~/.config/devs/server.addr`) and use the MCP port (default 7891)
- [ ] Implement the main bridge loop: read newline-delimited JSON-RPC from stdin → POST to `http://{server}/mcp/v1/call` → write response to stdout as newline-delimited JSON
- [ ] Implement connection loss detection: if the HTTP POST fails with a connection error, wait 1 second and retry once. If the retry also fails, write `{"result": null, "error": "internal: server connection lost", "fatal": true}` to stdout and exit with code 1 per 3_MCP_DESIGN-REQ-057
- [ ] For in-flight requests during connection loss: if a request was sent but no response received, emit an error JSON-RPC response for that request ID before the fatal message — never silently drop data
- [ ] Ensure the bridge binary is a separate executable from the main `devs` server binary

## 3. Code Review
- [ ] Verify the bridge never silently drops requests or responses
- [ ] Verify reconnection logic: exactly 1 retry after 1-second delay, then fatal exit
- [ ] Verify the fatal error message matches the exact format specified in 3_MCP_DESIGN-REQ-057
- [ ] Verify exit code is 1 on connection loss
- [ ] Verify discovery file resolution follows the same protocol as devs-cli

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp-bridge` and verify all tests pass
- [ ] Run `cargo clippy -p devs-mcp-bridge -- -D warnings`

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-040` to the bridge forwarding tests
- [ ] Add `// Covers: 3_MCP_DESIGN-REQ-057` to the connection loss and reconnection tests
- [ ] Add `// Covers: 3_MCP_DESIGN-REQ-SRV-002` to the stdio transport test
- [ ] Add doc comments to the bridge binary describing its purpose and usage

## 6. Automated Verification
- [ ] Run `cargo test -p devs-mcp-bridge -- --nocapture 2>&1 | grep -E "test result:"` and verify `0 failed`
- [ ] Run `cargo build -p devs-mcp-bridge` and verify the binary compiles
