# Task: Per-Stage Timeout with Graceful Escalation Sequence (Sub-Epic: 05_Error Handling & Timeouts)

## Covered Requirements
- [1_PRD-REQ-028], [2_TAS-REQ-092]

## Dependencies
- depends_on: [01_per_stage_retry_with_backoff.md]
- shared_components: [devs-scheduler (owner: Phase 2), devs-core (consumer), devs-adapters (consumer), devs-executor (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-scheduler/src/timeout.rs` (new module), write a unit test for `TimeoutEnforcer` that takes a `Duration` (stage timeout) and an `AgentProcess` handle, and executes the escalation sequence: write `devs:cancel\n` to stdin -> wait 5s -> SIGTERM -> wait 5s -> SIGKILL
- [ ] Write a test with a mock `AgentProcess` that exits after receiving `devs:cancel\n` on stdin. Assert: stage marked `TimedOut`, total elapsed time < 6s, stdin received exactly `devs:cancel\n`
- [ ] Write a test with a mock `AgentProcess` that ignores stdin but exits on SIGTERM. Assert: stage marked `TimedOut`, escalation proceeded to SIGTERM, total elapsed ~5s after cancel write
- [ ] Write a test with a mock `AgentProcess` that ignores both stdin and SIGTERM, only dies on SIGKILL. Assert: stage marked `TimedOut`, escalation proceeded through all 3 steps, total elapsed ~10s after cancel write
- [ ] Write a test confirming that regardless of the process's final exit code (0 or non-zero), the stage transitions to `TimedOut` state (not `Completed` or `Failed`)
- [ ] Write an integration test: define a stage with `timeout_secs = 1` (short for testing). Use a mock adapter that sleeps for 30s. Assert the timeout enforcer fires, the stage ends in `TimedOut`, and the process is killed
- [ ] Write a test that `StageRun.exit_code` is still recorded even when the stage times out (it captures whatever exit code the process returned after being killed)

## 2. Task Implementation
- [ ] Create `crates/devs-scheduler/src/timeout.rs` with `TimeoutEnforcer` struct
- [ ] Implement `TimeoutEnforcer::enforce(timeout: Duration, process: &mut AgentProcess) -> TimeoutResult` as an async function:
  1. `tokio::time::sleep(timeout)` — wait for the configured stage timeout
  2. Write `devs:cancel\n` to `process.stdin_writer()`
  3. `tokio::time::timeout(Duration::from_secs(5), process.wait())` — 5s grace period
  4. If still running: send SIGTERM via `process.cancel()` (or platform-appropriate signal)
  5. `tokio::time::timeout(Duration::from_secs(5), process.wait())` — 5s grace period
  6. If still running: send SIGKILL via `process.kill()`
  7. Return `TimeoutResult { exit_code: Option<i32>, timed_out: true }`
- [ ] In the scheduler's stage dispatch logic, spawn a concurrent `TimeoutEnforcer` task alongside the agent execution. Use `tokio::select!` to race the normal completion against the timeout enforcer
- [ ] When timeout wins the race, transition the `StageRun` to `TimedOut` state regardless of exit code
- [ ] Record `StageRun.exit_code` from the killed process (may be signal-based exit code like 137 for SIGKILL)
- [ ] Add `timeout_secs: Option<u64>` field to stage configuration struct if not already present
- [ ] Add `TimedOut` variant to `StageRunState` enum in `devs-core` if not already present

## 3. Code Review
- [ ] Verify the escalation sequence is exactly: stdin cancel -> 5s -> SIGTERM -> 5s -> SIGKILL as specified in [2_TAS-REQ-092]
- [ ] Verify no resource leaks: the spawned timeout task is cancelled if the agent completes normally before timeout
- [ ] Verify SIGTERM/SIGKILL logic is platform-aware (Unix signals vs Windows process termination)
- [ ] Verify the `tokio::select!` between normal completion and timeout does not hold scheduler locks

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- timeout` and confirm all timeout tests pass
- [ ] Run `cargo test -p devs-scheduler` and confirm no regressions

## 5. Update Documentation
- [ ] Add doc comments to `TimeoutEnforcer` documenting the 3-step escalation sequence
- [ ] Add `// Covers: 1_PRD-REQ-028` and `// Covers: 2_TAS-REQ-092` annotations to all timeout test functions

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures
- [ ] Run `./do lint` and confirm zero warnings
- [ ] Grep for `// Covers: 2_TAS-REQ-092` and confirm at least 4 test annotations exist
- [ ] Grep for `// Covers: 1_PRD-REQ-028` and confirm at least 2 test annotations exist
