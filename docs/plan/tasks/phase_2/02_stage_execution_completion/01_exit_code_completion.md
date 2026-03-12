# Task: Stage Completion Handler: Exit Code & Rate Limit (Sub-Epic: 02_Stage Execution & Completion)

## Covered Requirements
- [1_PRD-REQ-011], [2_TAS-REQ-091]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-adapters, devs-scheduler]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-scheduler` for `StageCompletionHandler::handle_exit_code`.
- [ ] Mock an `AgentAdapter` that returns `true` for `detect_rate_limit` under specific stderr patterns.
- [ ] Assert that a zero exit code transitions the `StageRun` to `Completed` via the `StateMachine`.
- [ ] Assert that a non-zero exit code without rate limit transitions to `Failed` with the correct reason.
- [ ] Assert that a non-zero exit code with rate limit triggers a pool fallback instead of an immediate terminal failure.

## 2. Task Implementation
- [ ] Implement `StageCompletionHandler` in `devs-scheduler/src/completion.rs`.
- [ ] Implement the `ExitCode` match arm of the completion dispatch logic as per `[2_TAS-REQ-091]`.
- [ ] Use the `AgentAdapter::detect_rate_limit` method to check for rate-limit conditions in stderr.
- [ ] Ensure that `StageRun.exit_code` is always recorded regardless of success/failure (as per `[3_PRD-BR-017]`).
- [ ] Integrate with the pool manager to trigger fallback when rate-limited.

## 3. Code Review
- [ ] Verify that the handler correctly differentiates between a standard process failure and a rate-limit condition.
- [ ] Ensure that state transitions are only made through the `StateMachine` trait.
- [ ] Check that no gRPC wire types are used in this domain logic (as per `[2_TAS-REQ-001G]`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler`.
- [ ] Ensure all tests pass with 100% coverage for the new handler.

## 5. Update Documentation
- [ ] Update `devs-scheduler/README.md` to document the exit code completion logic.
- [ ] Add doc comments to the new `StageCompletionHandler` methods.

## 6. Automated Verification
- [ ] Verify that the requirement tags `[1_PRD-REQ-011]` and `[2_TAS-REQ-091]` are correctly referenced in the new tests.
- [ ] Run `./do lint` and ensure no documentation warnings.
