# Task: MCP Stdio Bridge Binary (Sub-Epic: 051_Detailed Domain Specifications (Part 16))

## Covered Requirements
- [2_TAS-REQ-129]

## Dependencies
- depends_on: ["01_mcp_server_protocol.md"]
- shared_components: [devs-mcp-bridge (owner — this task creates the binary crate)]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp-bridge/tests/bridge_e2e.rs`. All test functions must include `// Covers: 2_TAS-REQ-129`.

### Basic forwarding
- [ ] `test_bridge_forwards_request_and_returns_response`: Start the MCP server on a random port. Spawn the `devs-mcp-bridge` binary as a child process with `--mcp-url http://127.0.0.1:<port>/rpc`. Write `{"jsonrpc":"2.0","method":"list_runs","params":{},"id":1}\n` to its stdin. Read one line from stdout. Assert the line is valid JSON-RPC 2.0 with `"id": 1` and a `result` field.
- [ ] `test_bridge_handles_multiple_sequential_requests`: Send 3 sequential requests (each on its own line) to stdin. Assert 3 corresponding responses appear on stdout, each on its own line, in order, with matching `id` fields (1, 2, 3).
- [ ] `test_bridge_does_not_buffer_responses`: Send one request. Measure the time until the response appears on stdout. Assert it arrives within 100ms of the server responding (i.e., no buffering delay). This validates the "does not buffer or batch" requirement.

### Connection loss handling
- [ ] `test_bridge_writes_error_on_server_connection_loss`: Start the MCP server, spawn the bridge, send one successful request to verify connectivity, then kill the MCP server process. Send another request to stdin. Assert stdout contains exactly: `{"jsonrpc":"2.0","id":null,"error":{"code":-32000,"message":"MCP server connection lost"}}` followed by a newline. Assert the bridge process exits with code 1.
- [ ] `test_bridge_writes_error_when_server_never_started`: Spawn the bridge pointing at a port with no server. Send a request to stdin. Assert the same connection-lost error JSON appears on stdout and exit code is 1.

### No silent discard
- [ ] `test_bridge_never_silently_discards`: Send a request that causes the server to return a JSON-RPC error (e.g., unknown method). Assert the error response IS forwarded to stdout (not swallowed). The bridge must forward all responses, including error responses.

### Stdin EOF handling
- [ ] `test_bridge_exits_cleanly_on_stdin_eof`: Close stdin without sending anything. Assert the bridge exits with code 0 (clean shutdown, no error since the server is still up).

## 2. Task Implementation
- [ ] Create `crates/devs-mcp-bridge/Cargo.toml` as a `[[bin]]` crate with dependencies: `tokio`, `reqwest` (with `rustls-tls`), `serde_json`, `clap` (for `--mcp-url` argument).
- [ ] Implement `main()` in `crates/devs-mcp-bridge/src/main.rs`:
  1. Parse CLI args: `--mcp-url <URL>` (required). Default URL can be derived from the server discovery file if `--mcp-url` is not provided (read `~/.config/devs/server.addr` and construct `http://<host>:<mcp_port>/rpc`), but `--mcp-url` takes precedence.
  2. Create a `reqwest::Client` (reuse across requests for connection pooling).
  3. Loop: read one line from `tokio::io::BufReader<tokio::io::stdin()>`.
     - On EOF: exit 0.
     - On line read: POST the raw line bytes to the MCP URL with `Content-Type: application/json`.
     - On successful HTTP response: write the response body to stdout, followed by `\n`. Flush stdout immediately after each write.
     - On connection error (reqwest returns `is_connect()` or `is_timeout()` error): write the mandatory error JSON `{"jsonrpc":"2.0","id":null,"error":{"code":-32000,"message":"MCP server connection lost"}}` to stdout followed by `\n`, flush, then `std::process::exit(1)`.
  4. Do NOT parse, validate, or transform the JSON-RPC payload in either direction — forward raw bytes.
- [ ] Ensure stdout is line-buffered or explicitly flushed after each write (use `tokio::io::stdout()` with explicit `.flush().await`).

## 3. Code Review
- [ ] Verify the bridge does NOT parse or modify the JSON-RPC request or response body — it is a transparent proxy.
- [ ] Verify the error JSON string is exactly as specified in [2_TAS-REQ-129] (character-for-character match).
- [ ] Verify the bridge does not import `tonic`, `devs-proto`, or `devs-core` — it is a standalone binary with minimal dependencies.
- [ ] Verify no sensitive data (request/response bodies) is logged at any log level below `trace`.
- [ ] Verify the bridge handles partial lines (line without trailing `\n`) at stdin EOF — it should still forward the request.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp-bridge` — all 7 tests must pass.
- [ ] Run `cargo clippy -p devs-mcp-bridge -- -D warnings` with zero warnings.

## 5. Update Documentation
- [ ] Add doc comments to `main()` explaining the bridge's role and protocol.
- [ ] Add `// Covers: 2_TAS-REQ-129` annotation to every test function.

## 6. Automated Verification
- [ ] Run `./do test` — must exit 0.
- [ ] Verify `target/traceability.json` contains an entry for `2_TAS-REQ-129` with at least one mapped test.
- [ ] Run `cargo tree -p devs-mcp-bridge` and verify `tonic` and `prost` do NOT appear in the dependency tree.
