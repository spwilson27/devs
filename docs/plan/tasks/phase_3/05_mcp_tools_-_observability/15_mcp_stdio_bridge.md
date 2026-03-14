# Task: Implement MCP stdio bridge binary (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-007], [3_MCP_DESIGN-REQ-057], [3_MCP_DESIGN-REQ-058], [3_MCP_DESIGN-REQ-064], [3_MCP_DESIGN-REQ-065]

## Dependencies
- depends_on: ["01_mcp_bridge.md"]
- shared_components: ["devs-mcp-bridge (owner)", "devs-server (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp-bridge/tests/bridge_behavior_test.rs`:
  - `test_bridge_forwards_request_to_mcp_server`: start mock MCP server on port X, run bridge with `MCP_PORT=X`, send JSON-RPC request to bridge stdin, assert identical request forwarded to server and response returned to stdout
  - `test_bridge_connection_loss_single_reconnect` (covers 3_MCP_DESIGN-REQ-057): start bridge, kill MCP server, assert bridge attempts one reconnection after 1 second
  - `test_bridge_connection_loss_final_error` (covers 3_MCP_DESIGN-REQ-057): after reconnection fails, assert bridge writes `{"result": null, "error": "internal: server connection lost", "fatal": true}` to stdout and exits with code 1
  - `test_bridge_request_line_max_length` (covers 3_MCP_DESIGN-REQ-064): send stdin line exceeding 1 MiB, assert bridge writes `{"jsonrpc":"2.0","id":null,"result":null,"error":"invalid_argument: request line exceeds 1 MiB"}` to stdout and continues processing
  - `test_bridge_streams_follow_mode_chunks` (covers 3_MCP_DESIGN-REQ-065): call `stream_logs` with `follow: true` through bridge, assert bridge emits one JSON object per line to stdout as each HTTP chunk arrives, forwards final `{"done": true}` chunk and returns to listening
  - `test_bridge_partial_line_buffering` (covers 3_MCP_DESIGN-REQ-064): send partial JSON line (no newline), then send remainder with newline, assert bridge buffers until complete line received before forwarding
  - `test_bridge_exit_code_1_on_fatal` (covers 3_MCP_DESIGN-REQ-007): trigger fatal error (server connection lost), assert bridge exits with code 1, not 0

- [ ] In `crates/devs-mcp-bridge/tests/integration_test.rs`:
  - `test_bridge_end_to_end_with_real_server`: start `devs-server`, start `devs-mcp-bridge` pointing to it, send `list_runs` request via bridge stdin, assert valid response on stdout

## 2. Task Implementation
- [ ] In `crates/devs-mcp-bridge/src/main.rs`, implement the bridge binary:
  - Read MCP server address from `DEVS_MCP_ADDR` env var or default to `http://localhost:7891`
  - Open HTTP client to MCP server
  - Read stdin line by line (buffering partial lines until `\n`)
  - Validate line length ≤ 1 MiB; reject oversized lines with structured error
  - Forward complete JSON-RPC lines to MCP server via HTTP POST
  - Write server responses to stdout as newline-delimited JSON
- [ ] Implement reconnection logic (3_MCP_DESIGN-REQ-057):
  - On connection loss, wait 1 second, attempt one reconnection
  - If reconnection fails, write fatal error to stdout and exit with code 1
  - Do not silently drop in-flight request/response data
- [ ] Implement streaming support for `stream_logs` (3_MCP_DESIGN-REQ-065):
  - Accumulate HTTP chunked response data
  - Emit one JSON object per line to stdout as each chunk arrives
  - Forward final `{"done": true}` chunk and return to listening for next stdin request
- [ ] Implement line length validation (3_MCP_DESIGN-REQ-064):
  - Maximum line length: 1 MiB
  - Reject oversized lines with structured error, continue processing subsequent lines

## 3. Code Review
- [ ] Verify reconnection logic does not leak HTTP client resources on failure
- [ ] Verify streaming mode correctly handles HTTP chunk boundaries (doesn't split JSON objects)
- [ ] Verify line buffering handles edge cases (empty lines, lines with only whitespace)
- [ ] Verify exit code 1 is used for all fatal errors, 0 for clean shutdown

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp-bridge` and confirm all pass

## 5. Update Documentation
- [ ] Add README.md for `devs-mcp-bridge` describing usage and environment variables
- [ ] Add doc comments to main loop describing the reconnection and streaming behavior

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
