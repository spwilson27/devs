# Task: Implement Rate Limit Detection and Stage Re-queue Logic (Sub-Epic: 02_Stage Execution & Completion)

## Covered Requirements
- [1_PRD-REQ-011], [2_TAS-REQ-091]

## Dependencies
- depends_on: ["01_completion_signal_types_and_exit_code_handler.md"]
- shared_components: ["devs-adapters (Consumer — uses detect_rate_limit from AgentAdapter trait)", "devs-pool (Consumer — calls report_rate_limit)", "devs-scheduler (Owner context — completion module)"]

## 1. Initial Test Written
- [ ] In `crates/devs-scheduler/src/completion/rate_limit.rs`, create test module `tests`.
- [ ] Write `test_rate_limit_detected_triggers_cooldown` — `ProcessOutput` with exit_code matching a known rate-limit pattern (e.g., exit code 429 or stderr containing "rate limit exceeded"). Call `check_rate_limit(&process_output)`. Assert it returns `Some(RateLimitInfo { cooldown_secs: 60 })`.
- [ ] Write `test_rate_limit_requeues_stage` — when rate limit is detected, verify the stage is re-queued (state transitions back to `Eligible`) and the attempt count is NOT incremented. Use a mock or test double for the scheduler's stage state.
- [ ] Write `test_no_rate_limit_normal_failure` — `ProcessOutput` with exit_code=1 and stderr "compilation error". Assert `check_rate_limit` returns `None`.
- [ ] Write `test_rate_limit_via_mcp_signal` — an active MCP rate-limit report arrives. Assert `CompletionResult::RateLimited { cooldown_secs: 60 }` is returned.

## 2. Task Implementation
- [ ] Create `crates/devs-scheduler/src/completion/rate_limit.rs`.
- [ ] Implement `check_rate_limit(output: &ProcessOutput) -> Option<RateLimitInfo>` that delegates to the adapter's `detect_rate_limit` method.
- [ ] Implement `handle_rate_limit(run_id: &RunId, stage: &str, info: RateLimitInfo, pool: &dyn PoolManager)` — calls `pool.report_rate_limit(agent_id, cooldown_until)` with a 60-second cooldown, transitions stage back to `Eligible`, and does NOT increment `attempt_count`.
- [ ] Integrate rate-limit checking into the `resolve_completion` dispatch: after getting a `Failed` result, check for rate-limit patterns. If detected, return `RateLimited` instead of `Failed`.
- [ ] Add `RateLimited` handling to the scheduler's main stage completion path so it re-queues instead of marking failed.

## 3. Code Review
- [ ] Verify the 60-second cooldown is used as specified.
- [ ] Verify attempt count is explicitly NOT incremented on rate-limit re-queue.
- [ ] Verify rate-limit detection does not panic on empty stderr or unusual exit codes.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- rate_limit` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-011` and `// Covers: 2_TAS-REQ-091` annotations to test functions.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- rate_limit --no-fail-fast 2>&1 | tail -20` and verify 0 failures.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify 0 warnings.
