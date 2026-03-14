# Task: Per-Stage Retry with Backoff Strategy (Sub-Epic: 05_Error Handling & Timeouts)

## Covered Requirements
- [1_PRD-REQ-027]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler (owner: Phase 2), devs-core (consumer), devs-adapters (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-scheduler/src/retry.rs` (new module), write unit tests for a `RetryPolicy` struct that holds `max_attempts: u32` and `backoff: BackoffStrategy` (enum: `Fixed(Duration)`, `Exponential { base: Duration, max: Duration }`)
- [ ] Test `RetryPolicy::should_retry(attempt: u32) -> bool`: returns `true` when `attempt < max_attempts`, `false` otherwise
- [ ] Test `RetryPolicy::delay_for(attempt: u32) -> Duration`: for `Fixed(5s)` always returns `5s`; for `Exponential { base: 1s, max: 30s }` returns `1s, 2s, 4s, 8s, 16s, 30s, 30s` (capped at max)
- [ ] Test that `attempt == 0` means first try (not a retry), so `should_retry(0)` is `true` when `max_attempts >= 1`
- [ ] In `crates/devs-scheduler/src/dispatch.rs`, write an integration test: create a stage with `max_attempts = 3` and `backoff = Fixed(Duration::ZERO)`. Mock the agent adapter to fail the first 2 attempts and succeed on the 3rd. Assert the stage transitions through `Running -> Failed -> Running -> Failed -> Running -> Completed` and `StageRun.attempt` increments to 3
- [ ] Write a test that when `max_attempts` is exhausted (all attempts fail), the stage transitions to `Failed` terminal state and does NOT retry again
- [ ] Write a test confirming rate-limit events do NOT increment `StageRun.attempt` — mock adapter returns a rate-limit signal; assert attempt counter stays the same and stage is re-queued
- [ ] Write a test for branch loopback retry: define a 2-stage workflow where stage B has an error branch routing back to stage A. When stage B fails, assert stage A is re-dispatched

## 2. Task Implementation
- [ ] Create `crates/devs-scheduler/src/retry.rs` with `RetryPolicy`, `BackoffStrategy` enum, `should_retry()`, and `delay_for()` methods
- [ ] Add `retry_policy: Option<RetryPolicy>` field to the stage configuration struct in the scheduler (the struct that holds per-stage config parsed from `WorkflowDefinition`)
- [ ] Add `attempt: u32` field to `StageRun` in `devs-core` if not already present; increment it only on genuine failure retries (not rate-limit re-queues)
- [ ] In the scheduler's stage completion handler (`dispatch.rs` or equivalent), after a stage fails: check `retry_policy.should_retry(stage_run.attempt)`, compute delay via `delay_for()`, and schedule a `tokio::time::sleep(delay)` before re-dispatching the stage to `Eligible` state
- [ ] If retries are exhausted, transition stage to `Failed` and evaluate workflow branch conditions (error branch / loopback)
- [ ] Implement branch loopback: when a branch condition routes to a previously-completed-or-failed stage, reset that stage to `Waiting`/`Eligible` and re-enter the dispatch loop
- [ ] Ensure rate-limit detection (from `devs-adapters`) triggers re-queue without incrementing `attempt`

## 3. Code Review
- [ ] Verify `RetryPolicy` is a pure data type with no async dependencies — it should be testable without tokio runtime
- [ ] Verify backoff delay computation has no overflow issues (exponential capped at `max`)
- [ ] Verify the retry loop does not hold any locks during the `sleep(delay)` period
- [ ] Verify branch loopback does not create infinite loops — the scheduler's existing cycle detection should prevent this at workflow validation time

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- retry` and confirm all retry-related tests pass
- [ ] Run `cargo test -p devs-scheduler -- dispatch` and confirm integration tests pass

## 5. Update Documentation
- [ ] Add doc comments to `RetryPolicy`, `BackoffStrategy`, `should_retry()`, `delay_for()` explaining semantics
- [ ] Add `// Covers: 1_PRD-REQ-027` annotations to all test functions

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures
- [ ] Run `./do lint` and confirm zero warnings
- [ ] Grep for `// Covers: 1_PRD-REQ-027` and confirm at least 5 test annotations exist
