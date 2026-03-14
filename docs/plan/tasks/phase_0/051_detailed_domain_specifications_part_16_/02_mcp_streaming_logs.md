# Task: MCP stream_logs Streaming Tool (Sub-Epic: 051_Detailed Domain Specifications (Part 16))

## Covered Requirements
- [2_TAS-REQ-128]

## Dependencies
- depends_on: ["01_mcp_server_protocol.md"]
- shared_components: [devs-mcp (owner — extends with stream_logs tool), devs-core (consumer — log/stage types)]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/tests/stream_logs.rs`. All test functions must include `// Covers: 2_TAS-REQ-128`.

### Non-streaming mode (`follow: false`)
- [ ] `test_stream_logs_follow_false_returns_single_json`: Send `{"jsonrpc":"2.0","method":"stream_logs","params":{"run_id":"r1","stage":"plan","follow":false},"id":1}` to `/rpc`. Assert the response is a single JSON-RPC response (not chunked) with `result` containing a `logs` array. Assert `Transfer-Encoding` header is NOT `chunked`.
- [ ] `test_stream_logs_follow_false_unknown_stage_returns_error`: Request logs for a non-existent stage. Assert JSON-RPC error with code `-32602` or a domain-specific error code.

### Streaming mode (`follow: true`)
- [ ] `test_stream_logs_follow_true_uses_chunked_encoding`: Send the stream_logs request with `follow: true`. Assert the HTTP response has `Transfer-Encoding: chunked`.
- [ ] `test_stream_logs_follow_true_sends_ndjson_chunks`: Start a mock stage that emits 3 log lines then completes. Connect with `follow: true`. Read the response body incrementally. Assert each chunk is a valid JSON object followed by `\n`. Assert 3 log chunks are received before the done chunk.
- [ ] `test_stream_logs_follow_true_ends_with_done_chunk`: After the stage reaches a terminal state (success or failure), assert the last chunk is exactly `{"done":true}\n` and the connection is closed by the server.
- [ ] `test_stream_logs_follow_true_client_disconnect_no_leak`: Connect with `follow: true`, read one chunk, then drop the client connection. Assert the server-side stream task is cleaned up (no lingering tasks). This can be tested by checking that the log subscription count returns to 0 after a short delay.
- [ ] `test_stream_logs_follow_true_stage_already_terminal`: Request `follow: true` on a stage that has already completed. Assert the response contains the full log snapshot followed by `{"done":true}\n`, then connection closes.

## 2. Task Implementation
- [ ] In `crates/devs-mcp/src/tools/stream_logs.rs`, implement the `StreamLogsHandler` struct implementing `ToolHandler`.
- [ ] Define `StreamLogsParams` struct: `run_id: String`, `stage: String`, `follow: bool`.
- [ ] For `follow: false`:
  - Look up the stage in the run state. If not found, return `JsonRpcError { code: -32602, message: "stage not found" }`.
  - Collect all log entries for the stage and return `{"logs": [...]}` as the JSON-RPC result.
- [ ] For `follow: true`:
  - Modify the `/rpc` handler to detect when a tool returns a `Stream` variant (introduce an enum `ToolResult { Json(Value), Stream(Pin<Box<dyn Stream<Item=Bytes>>>) }`).
  - When `ToolResult::Stream` is returned, set `Transfer-Encoding: chunked` and write chunks directly to the response body.
  - Each log entry is serialized as a JSON object followed by `\n` (newline-delimited JSON / NDJSON).
  - Subscribe to the stage's log channel (e.g., `tokio::sync::broadcast::Receiver`). Forward each new log entry as a chunk.
  - When the stage transitions to a terminal state (`Completed`, `Failed`, `Cancelled`), send `{"done":true}\n` and close the connection.
  - If the stage is already terminal at subscription time, send all existing logs + `{"done":true}\n` immediately.
- [ ] Handle client disconnection gracefully: wrap the stream in a `select!` or use `axum`'s built-in body cancellation to detect when the client drops, and clean up the broadcast subscription.
- [ ] Register `stream_logs` tool in `McpServer::new()` via `register_tool("stream_logs", StreamLogsHandler::new(state))`.

## 3. Code Review
- [ ] Verify that the streaming implementation does not hold locks while writing chunks — log data should be cloned out of any shared state before sending.
- [ ] Verify that `ToolResult` enum does not break existing non-streaming tools (they still return `ToolResult::Json`).
- [ ] Verify that the NDJSON format uses `\n` (LF, 0x0A) as delimiter, not `\r\n`.
- [ ] Verify that the `{"done":true}` chunk is a valid JSON object (not wrapped in JSON-RPC envelope — it is a raw stream chunk, not a JSON-RPC response).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test stream_logs` — all 7 tests must pass.
- [ ] Run `cargo clippy -p devs-mcp -- -D warnings` with zero warnings.

## 5. Update Documentation
- [ ] Add doc comments to `StreamLogsHandler`, `StreamLogsParams`, and `ToolResult` enum.
- [ ] Add `// Covers: 2_TAS-REQ-128` annotation to every test function in `stream_logs.rs`.

## 6. Automated Verification
- [ ] Run `./do test` — must exit 0.
- [ ] Run `./do coverage` — `stream_logs` handler must meet the 90% unit coverage gate (QG-001).
- [ ] Verify `target/traceability.json` contains an entry for `2_TAS-REQ-128` with at least one mapped test.
