# Task: Implement timeout and retry behavior requirements (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_PRD-BR-034], [3_PRD-BR-035], [3_PRD-BR-036]

## Dependencies
- depends_on: ["10_submit_run_tool.md"]
- shared_components: ["devs-core (consumer)", "devs-scheduler (consumer)", "devs-config (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-config/src/workflow/validation_test.rs`:
  - `test_stage_timeout_less_than_workflow_timeout_accepts`: workflow `timeout_secs: 300`, stage `timeout_secs: 60`, assert validation passes
  - `test_stage_timeout_equal_to_workflow_timeout_accepts`: workflow `timeout_secs: 300`, stage `timeout_secs: 300`, assert validation passes
  - `test_stage_timeout_exceeds_workflow_timeout_rejects` (covers 3_PRD-BR-034): workflow `timeout_secs: 60`, stage `timeout_secs: 120`, assert validation fails with structured error indicating the violation
  - `test_stage_timeout_without_workflow_timeout_accepts`: stage `timeout_secs: 60`, no workflow-level timeout, assert validation passes (stage timeout stands alone)
  - `test_workflow_timeout_without_stage_timeouts_accepts`: workflow `timeout_secs: 300`, no stage timeouts, assert validation passes

- [ ] In `crates/devs-scheduler/tests/retry_behavior_test.rs`:
  - `test_rate_limit_event_does_not_increment_attempt`: stage fails due to rate limit, pool falls back to next agent, assert `StageRun.attempt` remains unchanged (not incremented)
  - `test_genuine_failure_increments_attempt`: stage fails with non-rate-limit error, assert `attempt` increments by 1
  - `test_rate_limit_then_genuine_failure`: stage hits rate limit (attempt unchanged), then fails genuinely on retry, assert `attempt` is 1 (only the genuine failure counted)
  - `test_exhausted_retries_transitions_to_failed` (covers 3_PRD-BR-036): stage with `max_attempts: 3` fails 3 times, assert stage transitions to `Failed` terminal state
  - `test_exhausted_retries_evaluates_branch_conditions` (covers 3_PRD-BR-036): after stage fails due to exhausted retries, assert workflow branch conditions are evaluated
  - `test_no_branch_handler_for_failure_transitions_run_to_failed` (covers 3_PRD-BR-036): stage fails with no branch handler for the failure, assert run transitions to `Failed`

## 2. Task Implementation
- [ ] In `crates/devs-config/src/workflow/validation.rs`, implement timeout validation:
  - Function `validate_timeouts(workflow: &WorkflowDefinition) -> Result<(), Vec<ValidationError>>`
  - For each stage, if both `stage.timeout_secs` and `workflow.timeout_secs` are set, assert `stage.timeout_secs <= workflow.timeout_secs`
  - Collect all violations and return structured errors identifying the stage and both timeout values
- [ ] In `crates/devs-scheduler/src/retry_handler.rs`, implement rate-limit vs genuine failure distinction:
  - Function `should_increment_attempt(failure: &StageFailure) -> bool`
  - Return `false` for `StageFailure::RateLimit`, `true` for all other failure types
  - Ensure `report_rate_limit` path does not increment `attempt`
- [ ] In `crates/devs-scheduler/src/stage_lifecycle.rs`, implement exhausted retry handling:
  - When `attempt >= max_attempts`, transition stage to `Failed`
  - Evaluate workflow branch conditions for the failure
  - If no branch matches, transition run to `Failed`
  - Ensure atomic state transition with checkpoint

## 3. Code Review
- [ ] Verify timeout validation error message includes stage name, stage timeout, and workflow timeout
- [ ] Verify rate-limit detection correctly identifies rate-limit errors from agent stderr patterns
- [ ] Verify branch condition evaluation happens after stage failure, not before
- [ ] Verify run-level failure transition only happens when no branch handles the failure

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- validation` and confirm all pass
- [ ] Run `cargo test -p devs-scheduler -- retry` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments to timeout validation describing the constraint
- [ ] Add doc comments to retry handler describing rate-limit vs genuine failure distinction

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
