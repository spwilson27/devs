# Task: Implement stream_logs MCP tool (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-011], [3_MCP_DESIGN-REQ-EC-OBS-004], [3_MCP_DESIGN-REQ-EC-OBS-DBG-001], [3_MCP_DESIGN-REQ-EC-OBS-DBG-002], [3_MCP_DESIGN-REQ-EC-OBS-DBG-008]

## Dependencies
- depends_on: ["03_get_run_tool.md"]
- shared_components: ["devs-scheduler (consumer)", "devs-proto (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/tools/stream_logs_test.rs`:
  - `test_stream_logs_follow_false_returns_buffered_lines`: create a completed stage with 50 log lines, call `stream_logs` with `follow: false`, assert all 50 lines returned as newline-delimited JSON chunks, each with `sequence` field, final chunk has `{"done": true}`
  - `test_stream_logs_follow_true_streams_realtime`: start a stage, call `stream_logs` with `follow: true`, write 5 lines to stage log, assert 5 chunks arrive with sequential `sequence` values, then complete the stage, assert final `{"done": true}` chunk arrives
  - `test_stream_logs_follow_true_before_stage_starts` (EC-OBS-DBG-001): call `stream_logs` with `follow: true` on a `Waiting` stage, assert connection is accepted (no error), then start the stage and produce output, assert chunks arrive without reconnect
  - `test_stream_logs_follow_true_stage_cancelled_before_running` (EC-OBS-DBG-001): call `stream_logs` with `follow: true` on a stage that gets cancelled before dispatch, assert server sends `{"done": true, "truncated": false, "total_lines": 0}`
  - `test_stream_logs_buffer_exceeds_10000_lines` (EC-OBS-DBG-002): produce 15,000 log lines for a completed stage, call `stream_logs` with `follow: false`, assert exactly 10,000 lines returned with `"truncated": true` in terminal chunk
  - `test_stream_logs_from_sequence_beyond_buffer` (EC-OBS-DBG-008): completed stage with 100 lines, call with `from_sequence: 200`, assert only terminal chunk `{"done": true, "truncated": false, "total_lines": 100}` is returned, no non-terminal chunks
  - `test_stream_logs_client_disconnect_midstream` (EC-OBS-004): start `follow: true` stream, drop the client connection after 3 chunks, assert server does not panic or leak resources (verify via subsequent successful stream_logs call)
  - `test_stream_logs_chunk_format`: assert each non-terminal chunk has fields: `line`, `sequence`, `timestamp`; terminal chunk has `done`, `truncated`, `total_lines`

## 2. Task Implementation
- [ ] In `crates/devs-mcp/src/tools/observability.rs`, implement `stream_logs` handler:
  - Accept: `run_id: String`, `stage_name: String`, `follow: bool`, `from_sequence: Option<u64>`
  - Maintain per-stage in-memory log buffer (ring buffer, max 10,000 lines) with monotonically increasing `sequence` numbers
  - If `follow: false`: return all buffered lines (from `from_sequence` if specified) as newline-delimited JSON, then send terminal chunk
  - If `follow: true`: return buffered lines, then keep connection open via HTTP chunked transfer encoding; push new lines as they arrive via a `tokio::sync::broadcast` or `watch` channel subscription
  - When stage reaches terminal state, send `{"done": true, "truncated": <bool>, "total_lines": <N>}` and close
  - If stage hasn't started yet and `follow: true`, hold the connection open until stage starts or reaches terminal state (EC-OBS-DBG-001)
  - If `from_sequence` > max buffered sequence on a completed stage, emit only terminal chunk (EC-OBS-DBG-008)
  - Handle client disconnect gracefully — drop the sender, no panic (EC-OBS-004)
- [ ] Implement `LogBuffer` struct in `crates/devs-mcp/src/log_buffer.rs`:
  - Ring buffer of 10,000 entries with `sequence` counter
  - `push(line: String)` — append, evict oldest if full
  - `lines_from(seq: u64) -> Vec<LogEntry>` — return lines from given sequence
  - `subscribe() -> broadcast::Receiver<LogEntry>` — for follow mode
- [ ] Register `stream_logs` in the MCP tool registry

## 3. Code Review
- [ ] Verify ring buffer eviction is O(1) and doesn't cause reallocation
- [ ] Verify `sequence` numbers are globally monotonic per stage (not reset on buffer wrap)
- [ ] Verify client disconnect doesn't cause a task leak in the follow loop
- [ ] Verify `truncated` field is `true` only when lines were evicted from the ring buffer

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- stream_logs` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments on `LogBuffer` and the streaming protocol

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
