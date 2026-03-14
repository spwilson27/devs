# Task: Implement MCP Tool Call Completion Handler (Sub-Epic: 02_Stage Execution & Completion)

## Covered Requirements
- [1_PRD-REQ-011], [2_TAS-REQ-091]

## Dependencies
- depends_on: ["01_completion_signal_types_and_exit_code_handler.md"]
- shared_components: ["devs-scheduler (Owner context — completion module)"]

## 1. Initial Test Written
- [ ] In `crates/devs-scheduler/src/completion/mcp_tool_call.rs`, create test module `tests`.
- [ ] Write `test_mcp_signal_received_success` — simulate a `signal_completion` MCP tool call arriving with `{ "success": true, "data": {...} }` while the stage is in `Running` state. Assert `CompletionResult::Success` with the provided structured output.
- [ ] Write `test_mcp_signal_received_failure` — signal with `{ "success": false, "error": "review rejected" }`. Assert `CompletionResult::Failed` with the error message.
- [ ] Write `test_mcp_signal_on_terminal_state_returns_error` — stage is already `Completed`. Call the signal handler. Assert it returns an error with message containing `"failed_precondition: stage is already in a terminal state"`.
- [ ] Write `test_mcp_fallback_to_exit_code_on_no_signal` — stage configured with `McpToolCall` but agent exits (exit_code=0) without calling `signal_completion`. Assert `CompletionResult::Success` with `exit_code: 0` and no structured output (fallback behavior).
- [ ] Write `test_mcp_fallback_to_exit_code_nonzero` — agent exits with code 1 without calling `signal_completion`. Assert `CompletionResult::Failed`.
- [ ] Write `test_exit_code_recorded_with_mcp_signal` — MCP signal arrives with success, then process exits with code 0. Assert `exit_code: 0` is recorded.

## 2. Task Implementation
- [ ] Define `McpCompletionSignal` struct: `success: bool`, `data: Option<serde_json::Value>`, `error: Option<String>`.
- [ ] Implement `handle_mcp_signal(signal: McpCompletionSignal, stage_state: &StageRunState) -> Result<CompletionResult, CompletionError>`.
- [ ] If `stage_state` is terminal (`Completed`, `Failed`, `TimedOut`, `Cancelled`), return `Err(CompletionError::FailedPrecondition("stage is already in a terminal state"))`.
- [ ] If `signal.success` is true, return `Success` with the data as structured_output.
- [ ] If `signal.success` is false, return `Failed` with error message.
- [ ] Implement `resolve_mcp_fallback(output: &ProcessOutput) -> CompletionResult` for when the process exits without an MCP signal — delegates to exit_code logic.
- [ ] Wire `McpToolCall` variant in `resolve_completion` to call `resolve_mcp_fallback` (the MCP signal path is invoked separately when the signal arrives mid-run, not at process exit).

## 3. Code Review
- [ ] Verify the `failed_precondition` error string matches the exact format specified: `"failed_precondition: stage is already in a terminal state"`.
- [ ] Verify terminal state detection uses the `StageRunState` enum from devs-core.
- [ ] Verify no blocking I/O in the MCP signal handler (it's called from async context).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- mcp_tool_call` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-011` and `// Covers: 2_TAS-REQ-091` annotations to test functions.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- mcp_tool_call --no-fail-fast 2>&1 | tail -20` and verify 0 failures.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify 0 warnings.
