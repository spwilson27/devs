# Task: MCP stream_logs Tool Semantics (Sub-Epic: 051_Detailed Domain Specifications (Part 16))

## Covered Requirements
- [2_TAS-REQ-128]

## Dependencies
- depends_on: [01_mcp_server_protocol.md]
- shared_components: [devs-mcp]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-mcp/tests/stream_logs.rs` that calls the `stream_logs` tool via the `/rpc` endpoint.
- [ ] Verify that with `follow: false`, the response is a single JSON object containing the full log snapshot.
- [ ] Verify that with `follow: true`, the response uses `Transfer-Encoding: chunked`.
- [ ] Verify that the streaming response contains newline-delimited JSON chunks.
- [ ] Verify that the stream ends with a final `{"done": true}` chunk before closing.

## 2. Task Implementation
- [ ] In `crates/devs-mcp`, implement the `stream_logs` tool handler.
- [ ] Use `axum::response::Sse` or raw `Body` with chunked encoding for the streaming mode.
- [ ] Implement logic to read logs from `devs-checkpoint` or the live log buffer.
- [ ] Ensure that for `follow: true`, the handler maintains a subscription until the stage reaches a terminal state.
- [ ] Emit the final `{"done": true}` chunk when the stage terminates.

## 3. Code Review
- [ ] Verify that the streaming implementation does not leak memory or open file handles.
- [ ] Ensure that the connection closure is handled gracefully by the server.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test stream_logs` and ensure the tests pass.

## 5. Update Documentation
- [ ] Document the `stream_logs` tool behavior in the `devs-mcp` technical documentation.

## 6. Automated Verification
- [ ] Run `./do coverage` to ensure the `stream_logs` tool logic is fully covered.
- [ ] Verify requirement traceability for [2_TAS-REQ-128] via `target/traceability.json`.
