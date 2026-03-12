# Task: Automatic Stage Retry and Backoff Management (Sub-Epic: 05_Error Handling & Timeouts)

## Covered Requirements
- [1_PRD-REQ-027]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Write unit tests for retry delay computation (`2_TAS-REQ-033B`):
    - [ ] `Fixed`: Verify `initial_delay` is constant.
    - [ ] `Linear`: Verify `initial * attempt` capped at `max`.
    - [ ] `Exponential`: Verify `min(initial^attempt, max)`.
- [ ] Write a scheduler unit test:
    - [ ] Set `max_attempts: 3`.
    - [ ] Mock a stage that always fails (non-zero exit).
    - [ ] Verify the stage is re-queued 3 times before transitioning to `Failed`.
    - [ ] Verify `StageRun.attempt` increments only on retries.
    - [ ] Verify rate-limit events do NOT increment the retry counter (`3_PRD-BR-035`).

## 2. Task Implementation
- [ ] Update the `StageDefinition` in `devs-core` to include `max_attempts` and `RetryStrategy` (with `Fixed`, `Linear`, `Exponential` variants).
- [ ] Implement the delay calculation logic in `devs-scheduler`'s `RetryManager`.
- [ ] Update the scheduler's event handler to check for retries on stage failure (`StageStatus::Failed` or `StageStatus::TimedOut` if applicable).
- [ ] If `attempt < max_attempts`, schedule a re-dispatch after the calculated delay using `tokio::time::sleep`.
- [ ] Ensure that a stage being retried is set back to `Pending` (or a dedicated `Retrying` state) and correctly recorded in the checkpoint.
- [ ] Ensure `3_PRD-BR-035`: if the failure was a rate-limit event, trigger pool fallback but don't count it as a retry attempt.
- [ ] Implement `3_PRD-BR-036`: exhausted retries transition the stage to a terminal `Failed` state and trigger error branch evaluation.

## 3. Code Review
- [ ] Verify that the retry delay is non-blocking to other scheduler operations.
- [ ] Ensure that `StageRun.attempt` is correctly initialized and incremented.
- [ ] Confirm that `Fixed`, `Linear`, and `Exponential` math is correct and handles overflows.
- [ ] Check that `3_PRD-BR-035` correctly differentiates between an agent execution failure and a pool-level rate limit.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler`.
- [ ] Verify 90% unit test coverage for the retry and backoff logic.

## 5. Update Documentation
- [ ] Document the retry and backoff strategies in the project's developer guide.

## 6. Automated Verification
- [ ] Run `./do test` and verify that requirement `[1_PRD-REQ-027]` and business rules `[3_PRD-BR-035]`, `[3_PRD-BR-036]` are marked as covered.
