# Task: Implement devs-mcp-bridge stdio transport binary (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-007]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-proto (consumer)", "Server Discovery Protocol (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp-bridge/tests/bridge_e2e.rs` with tests:
  - `test_bridge_forwards_jsonrpc_stdin_to_mcp_port`: spawn a mock MCP HTTP server on a random port, write a discovery file pointing to it, spawn the bridge binary, write a valid JSON-RPC request to the bridge's stdin, assert the bridge writes the server's JSON-RPC response to stdout
  - `test_bridge_connection_loss_writes_error_and_exits_1`: spawn bridge pointing at a port with no listener, assert stdout receives a structured JSON error object with `"error"` key, assert exit code is 1
  - `test_bridge_reads_discovery_file_for_mcp_port`: set `DEVS_DISCOVERY_FILE` to a temp path, write `127.0.0.1:grpc_port` content, assert bridge connects to the correct MCP port (MCP port = grpc_port + 1 per convention, or read from discovery)
  - `test_bridge_explicit_server_flag_overrides_discovery`: pass `--server 127.0.0.1:<port>` flag, assert bridge uses that address instead of discovery file

## 2. Task Implementation
- [ ] Create `crates/devs-mcp-bridge/Cargo.toml` with dependencies: `tokio`, `serde_json`, `clap`, `reqwest` (or `hyper` client). Add to workspace `Cargo.toml`
- [ ] Implement `main.rs`:
  - Parse `--server <host:port>` optional flag via `clap`
  - If no `--server`, resolve MCP address via Server Discovery Protocol (`DEVS_DISCOVERY_FILE` env → `~/.config/devs/server.addr`)
  - Read lines from stdin in a loop; each line is a JSON-RPC request
  - Forward each request as HTTP POST to `http://<mcp_host>:<mcp_port>/` with `Content-Type: application/json`
  - Write the HTTP response body to stdout followed by a newline
  - On connection error (connect refused, timeout, reset), write `{"jsonrpc":"2.0","error":{"code":-32000,"message":"connection lost"},"id":null}` to stdout and exit with code 1

## 3. Code Review
- [ ] Verify no panics on malformed stdin input (graceful JSON parse errors returned as JSON-RPC error responses)
- [ ] Verify the bridge does NOT buffer multiple requests before sending — each line is forwarded immediately
- [ ] Verify structured error object matches JSON-RPC 2.0 error format

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp-bridge` and confirm all tests pass

## 5. Update Documentation
- [ ] Add doc comments to `main.rs` explaining the bridge's purpose and usage

## 6. Automated Verification
- [ ] Run `./do test` and confirm `devs-mcp-bridge` tests appear in output with no failures
