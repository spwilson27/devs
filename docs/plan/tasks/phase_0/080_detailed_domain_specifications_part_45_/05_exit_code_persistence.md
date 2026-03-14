# Task: Stage Run Exit Code Persistence (Sub-Epic: 080_Detailed Domain Specifications (Part 45))

## Covered Requirements
- [2_TAS-REQ-479]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core"]

## 1. Initial Test Written
- [ ] In `devs-core`, create test module `tests::exit_code_persistence`
- [ ] Write test `test_exit_code_recorded_on_exit_code_completion`: create a `StageRun` with `completion = ExitCode`. Simulate process exit with code `0`. Assert `stage_run.exit_code == Some(0)`. Repeat with code `1`, assert `Some(1)`.
- [ ] Write test `test_exit_code_recorded_on_structured_output_completion`: create a `StageRun` with `completion = StructuredOutput`. Simulate process exit with code `0`. Assert `stage_run.exit_code == Some(0)` — exit code is recorded regardless of completion signal type.
- [ ] Write test `test_exit_code_recorded_on_mcp_tool_call_completion`: same as above but with `completion = McpToolCall`. Assert exit code is still recorded.
- [ ] Write test `test_sigkill_records_negative_nine`: simulate a process killed by SIGKILL. Assert `stage_run.exit_code == Some(-9)` (or platform equivalent signal representation).
- [ ] Write test `test_timeout_records_null_then_actual`: create a `StageRun` that times out. Before the process exits, assert `stage_run.exit_code == None`. Then simulate the process finally exiting with code `137`. Assert `stage_run.exit_code == Some(137)`.
- [ ] Write test `test_exit_code_initial_state_is_none`: create a new `StageRun`. Assert `stage_run.exit_code == None`.

## 2. Task Implementation
- [ ] In the `StageRun` struct, ensure `exit_code: Option<i32>` field exists (use `i32` to support negative signal values like `-9`).
- [ ] Initialize `exit_code` to `None` in the constructor.
- [ ] Create method `pub fn record_exit_code(&mut self, code: i32)` that sets `self.exit_code = Some(code)`. This must be called for every stage execution regardless of the `completion` signal type.
- [ ] Create method `pub fn record_signal_kill(&mut self, signal: i32)` that sets `self.exit_code = Some(-signal)` (e.g., SIGKILL=9 → exit_code=-9).
- [ ] In the timeout handling path: when a stage times out and the process has not yet exited, the checkpoint is written with `exit_code = None`. When the process subsequently exits, `record_exit_code` is called to update the field. Document this two-phase behavior in the method doc comments.
- [ ] Ensure all completion signal processing paths (exit_code, structured_output, mcp_tool_call) call `record_exit_code` after the process terminates.

## 3. Code Review
- [ ] Verify exit code is recorded for ALL completion signal types, not just `ExitCode`.
- [ ] Verify SIGKILL produces `-9` (not `137` which is `128 + 9` — the requirement specifies `-9` or platform equivalent; choose one convention and document it).
- [ ] Verify the timeout path correctly handles the `None` → `Some(code)` two-phase update.
- [ ] Verify `exit_code` is serializable (for checkpoint persistence).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core exit_code_persistence` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-479` annotation to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core exit_code_persistence -- --nocapture` and verify zero failures. Grep for `2_TAS-REQ-479`.
