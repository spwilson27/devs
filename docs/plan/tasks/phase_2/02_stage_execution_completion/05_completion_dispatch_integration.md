# Task: Integrate Completion Signal Dispatch into Scheduler Stage Lifecycle (Sub-Epic: 02_Stage Execution & Completion)

## Covered Requirements
- [1_PRD-REQ-011], [2_TAS-REQ-091]

## Dependencies
- depends_on: ["01_completion_signal_types_and_exit_code_handler.md", "02_structured_output_handler.md", "03_mcp_tool_call_completion_handler.md", "04_rate_limit_detection_and_requeue.md"]
- shared_components: ["devs-scheduler (Owner context — scheduler core loop)", "devs-pool (Consumer — release_agent after completion)", "devs-checkpoint (Consumer — save checkpoint after state transition)"]

## 1. Initial Test Written
- [ ] In `crates/devs-scheduler/src/dispatch/mod.rs` (or equivalent), create integration test module `tests::stage_completion_integration`.
- [ ] Write `test_stage_completes_via_exit_code_and_transitions_state` — set up a minimal scheduler with one stage configured with `CompletionSignal::ExitCode`. Simulate agent process exit with code 0. Assert `StageRunState` transitions from `Running` to `Completed`.
- [ ] Write `test_stage_completes_via_structured_output_and_stores_output` — stage configured with `StructuredOutput`. Agent writes `.devs_output.json` with `{"success": true, "result": "ok"}`. Assert stage transitions to `Completed` and `get_stage_output` returns the JSON.
- [ ] Write `test_stage_completes_via_mcp_and_stores_output` — stage configured with `McpToolCall`. Agent calls `signal_completion` with success. Assert stage transitions to `Completed`.
- [ ] Write `test_stage_failure_triggers_retry_or_error_branch` — stage fails (exit_code=1, no rate limit). Assert stage transitions to `Failed` (retry logic is tested in the retry sub-epic; here just verify the completion result is correctly passed to the state machine).
- [ ] Write `test_all_three_signals_record_exit_code` — run three stages each with a different signal type, all exiting with code 42. Assert all three `StageRun` records have `exit_code == Some(42)`.
- [ ] Write `test_completion_releases_agent_lease` — after completion, assert the agent lease is released back to the pool.

## 2. Task Implementation
- [ ] In the scheduler's stage execution loop (where it awaits agent process completion), add a call to `resolve_completion(stage.completion_signal, &process_output)` to determine the `CompletionResult`.
- [ ] Match on `CompletionResult`: `Success` → transition stage to `Completed`, store structured output, release agent. `Failed` → transition stage to `Failed`, release agent. `RateLimited` → re-queue stage (do not release agent — report rate limit to pool instead).
- [ ] Ensure `StageRun.exit_code` is set from `ProcessOutput.exit_code` regardless of which completion signal variant was used.
- [ ] After state transition, trigger checkpoint save via `devs-checkpoint`.
- [ ] For `McpToolCall` signal: register a callback/channel so that when a `signal_completion` MCP call arrives, it invokes `handle_mcp_signal`. If the process exits before a signal, invoke `resolve_mcp_fallback`.
- [ ] Emit appropriate stage lifecycle events for the webhook dispatcher (stage completed / stage failed).

## 3. Code Review
- [ ] Verify lock acquisition order is followed when updating stage state (per shared concurrency patterns).
- [ ] Verify no deadlock: agent release and state update are not holding the same lock simultaneously.
- [ ] Verify checkpoint save is called after state transition, not before.
- [ ] Verify the webhook event is emitted after checkpoint save.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- stage_completion_integration` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-011` and `// Covers: 2_TAS-REQ-091` annotations to test functions.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler --no-fail-fast 2>&1 | tail -20` and verify 0 failures.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify 0 warnings.
- [ ] Run `./do lint` and verify no errors related to devs-scheduler.
