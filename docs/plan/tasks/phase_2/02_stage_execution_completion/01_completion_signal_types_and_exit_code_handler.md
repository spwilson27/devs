# Task: Define CompletionSignal Enum and Exit Code Handler (Sub-Epic: 02_Stage Execution & Completion)

## Covered Requirements
- [1_PRD-REQ-011], [2_TAS-REQ-091]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (Consumer — uses StageRunState, error types)", "devs-adapters (Consumer — uses ProcessOutput)", "devs-scheduler (Owner context — this code lives in devs-scheduler)"]

## 1. Initial Test Written
- [ ] In `crates/devs-scheduler/src/completion/mod.rs` (or equivalent module), create a test module `tests::completion_signal`.
- [ ] Write a test `test_exit_code_zero_is_success` that constructs a `ProcessOutput { exit_code: 0, stdout: "", stderr: "" }` and calls `resolve_completion(CompletionSignal::ExitCode, &process_output)`. Assert the result is `CompletionResult::Success { exit_code: 0, structured_output: None }`.
- [ ] Write a test `test_exit_code_nonzero_is_failure` that constructs a `ProcessOutput { exit_code: 1, .. }` and calls `resolve_completion(CompletionSignal::ExitCode, &process_output)`. Assert the result is `CompletionResult::Failed { exit_code: 1, error: None }`.
- [ ] Write a test `test_exit_code_recorded_regardless_of_signal_type` that uses `CompletionSignal::StructuredOutput` with exit_code=0 and valid JSON output. Assert `CompletionResult` contains `exit_code: Some(0)`.
- [ ] Write a test `test_completion_signal_enum_variants` that asserts the `CompletionSignal` enum has exactly three variants: `ExitCode`, `StructuredOutput`, `McpToolCall`.

## 2. Task Implementation
- [ ] Create module `crates/devs-scheduler/src/completion/mod.rs` with submodules `exit_code`, `structured_output`, `mcp_tool_call`.
- [ ] Define `CompletionSignal` enum with three variants: `ExitCode`, `StructuredOutput`, `McpToolCall`. Derive `Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize`.
- [ ] Define `CompletionResult` enum with variants: `Success { exit_code: i32, structured_output: Option<serde_json::Value> }`, `Failed { exit_code: i32, error: Option<String> }`, `RateLimited { cooldown_secs: u64 }`.
- [ ] Implement `resolve_completion(signal: CompletionSignal, output: &ProcessOutput) -> CompletionResult` as a dispatch function that delegates to signal-specific handlers.
- [ ] Implement the `ExitCode` handler: zero exit code → `Success`, non-zero → `Failed`. Always record exit_code.
- [ ] Ensure `CompletionResult` always carries `exit_code` regardless of which `CompletionSignal` variant was configured (per requirement that `StageRun.exit_code` is always recorded).

## 3. Code Review
- [ ] Verify `CompletionSignal` and `CompletionResult` are defined in devs-scheduler, not devs-core (wire types stay in devs-proto, domain scheduling types in devs-scheduler).
- [ ] Verify no `unwrap()` or `panic!()` in non-test code.
- [ ] Verify doc comments on all public types and functions.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- completion` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-011` and `// Covers: 2_TAS-REQ-091` annotations to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- completion --no-fail-fast 2>&1 | tail -20` and verify 0 failures.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify 0 warnings.
