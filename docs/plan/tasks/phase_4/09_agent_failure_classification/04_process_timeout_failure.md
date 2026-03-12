# Task: Implement Process Timeout Classification (Sub-Epic: 09_Agent Failure Classification)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-012]

## Dependencies
- depends_on: [01_coverage_gate_failure.md]
- shared_components: [devs-core, devs-mcp, devs-scheduler]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-cli/src/diagnose/classification.rs` that mocks a `StageRun` with `StageStatus::TimedOut`.
- [ ] Assert that the classifier returns `FailureClassification::Timeout`.
- [ ] Write an E2E test that submits a run with a stage that sleeps longer than its configured `timeout_seconds`.
- [ ] Verify that the agent correctly identifies the timeout and suggests reading the last lines of `stderr`.

## 2. Task Implementation
- [ ] Add the `Timeout` variant to the `FailureClassification` enum.
- [ ] Extend `classify_failure` to check the `status` field in the stage run record.
- [ ] If `status` is `TimedOut`, perform a scan of the last 10 lines of `stderr` for "hang indicators" or infinite loop patterns (e.g., repeated log messages).
- [ ] Include the configured timeout value and total elapsed time in the classification result for context.

## 3. Code Review
- [ ] Ensure that a timeout takes precedence over any other partial errors that may have been logged.
- [ ] Verify that the classification logic suggests checking for resource contention if no hang indicators are found in `stderr`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-cli --lib diagnose::classification` to verify the timeout detection.
- [ ] Run `cargo test --test diagnostic_loop_tests` to verify the E2E timeout case.

## 5. Update Documentation
- [ ] Add doc comments explaining the timeout detection rule (`StageStatus == TimedOut`).

## 6. Automated Verification
- [ ] Run `./do test` and verify that the timeout classification test passes.
- [ ] Verify traceability for `[3_MCP_DESIGN-REQ-BR-012]`.
