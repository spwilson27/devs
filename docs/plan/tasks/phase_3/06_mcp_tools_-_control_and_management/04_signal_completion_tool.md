# Task: Implement signal_completion MCP Tool with Concurrency Controls (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-024], [3_MCP_DESIGN-REQ-NEW-002], [3_MCP_DESIGN-REQ-BR-037], [3_MCP_DESIGN-REQ-BR-038], [3_MCP_DESIGN-REQ-BR-039], [3_MCP_DESIGN-REQ-BR-040], [3_MCP_DESIGN-REQ-BR-041], [3_MCP_DESIGN-REQ-BR-042], [3_MCP_DESIGN-REQ-BR-043], [3_MCP_DESIGN-REQ-BR-044], [3_MCP_DESIGN-REQ-EC-AGENT-001], [3_MCP_DESIGN-REQ-EC-AGENT-004], [3_MCP_DESIGN-REQ-EC-MCP-004]

## Dependencies
- depends_on: ["01_submit_run_tool.md"]
- shared_components: ["devs-scheduler (consumer — signal_completion, per-run mutex)", "devs-core (consumer — CompletionResult, StageRunState)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/src/tools/control/signal_completion_tests.rs`
- [ ] **Test: `test_signal_completion_success`** — Call `signal_completion(run_id, stage_name, {exit_code: 0, output: {}})`. Assert stage transitions to `Completed` and acknowledgement returned within 500ms. Covers [3_MCP_DESIGN-REQ-024], [3_MCP_DESIGN-REQ-NEW-002].
- [ ] **Test: `test_signal_completion_500ms_timeout`** — Instrument the handler to measure wall-clock time. Assert response is sent within 500ms of receipt. Covers [3_MCP_DESIGN-REQ-NEW-002].
- [ ] **Test: `test_signal_completion_serialized_per_run`** — Send two concurrent `signal_completion` calls for different stages of the same run. Assert they are serialized (per-run mutex). Covers [3_MCP_DESIGN-REQ-BR-044], [3_MCP_DESIGN-REQ-EC-MCP-004].
- [ ] **Test: `test_signal_completion_parallel_across_runs`** — Send concurrent `signal_completion` for different runs. Assert they execute in parallel (no global serialization). Covers [3_MCP_DESIGN-REQ-BR-044].
- [ ] **Test: `test_signal_completion_observation_reads_parallel`** — Verify observation tools (read locks) can execute in parallel with each other. Verify control tools (write locks) are serialized. Covers [3_MCP_DESIGN-REQ-BR-037], [3_MCP_DESIGN-REQ-BR-038].
- [ ] **Test: `test_signal_completion_lock_timeout_5s`** — Simulate a held write lock for >5 seconds. Assert subsequent tool call returns `deadline_exceeded` after 5-second timeout. Covers [3_MCP_DESIGN-REQ-BR-039].
- [ ] **Test: `test_signal_completion_then_nonzero_exit`** — Agent calls `signal_completion` with success, but process exits non-zero afterward. Assert the completion signal takes precedence (stage remains Completed). Covers [3_MCP_DESIGN-REQ-EC-AGENT-001].
- [ ] **Test: `test_signal_completion_output_array_not_object`** — Call with `output` field as JSON array instead of object. Assert `invalid_argument` error. Covers [3_MCP_DESIGN-REQ-EC-AGENT-004].
- [ ] **Test: `test_stream_logs_follow_no_scheduler_lock`** — Assert `stream_logs` with `follow: true` does NOT hold the scheduler write lock during wait. Covers [3_MCP_DESIGN-REQ-BR-040].
- [ ] **Test: `test_mcp_64_concurrent_connections`** — Open 64 concurrent MCP HTTP connections. Assert all are handled without rejection. Covers [3_MCP_DESIGN-REQ-BR-041].

## 2. Task Implementation
- [ ] Create `crates/devs-mcp/src/tools/control/signal_completion.rs`
- [ ] Define `SignalCompletionParams`: `run_id: String`, `stage_name: String`, `result: CompletionResult` where `CompletionResult` has `exit_code: Option<i32>`, `output: Option<serde_json::Value>`
- [ ] Validate `output` is a JSON object if present (not array, not scalar) — return `invalid_argument` otherwise
- [ ] Acquire per-run `tokio::sync::Mutex` (not the global scheduler RwLock) for serialization within a run
- [ ] Implement 500ms acknowledgement: the handler must respond within 500ms; any post-processing (checkpoint save, downstream dispatch) happens asynchronously after the response
- [ ] Delegate to `devs-scheduler::signal_completion()` for state transition and downstream stage dispatch
- [ ] Implement 5-second lock acquisition timeout using `tokio::time::timeout` — return `deadline_exceeded` on timeout
- [ ] Register in MCP router as `"signal_completion"`

## 3. Code Review
- [ ] Verify per-run mutex is used (not global write lock) for signal_completion serialization
- [ ] Verify 500ms ack is achieved by responding before checkpoint I/O completes
- [ ] Verify observation tools only acquire read locks (BR-037)
- [ ] Verify control tools acquire write locks (BR-038)
- [ ] Verify lock timeout is exactly 5 seconds (BR-039)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --lib tools::control::signal_completion_tests`

## 5. Update Documentation
- [ ] Doc comments on 500ms ack constraint, per-run mutex rationale, and lock ordering

## 6. Automated Verification
- [ ] Run `./do test` — all signal_completion tests pass
- [ ] Run `./do lint` — zero warnings
