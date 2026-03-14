# Task: Implement Presubmit Check Enforcement After Green Stage (Sub-Epic: 07_Agent Diagnostic Behaviors)

## Covered Requirements
- [3_MCP_DESIGN-REQ-030]

## Dependencies
- depends_on: [06_test_failure_verification.md]
- shared_components: [devs-mcp, devs-scheduler, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-cli/tests/presubmit_enforcement_tests.rs` that verifies the following behaviors:
    1. **Test 1.1 - Presubmit Submission After Green**: Simulate a completed Green stage (implementation written, tests passing). Verify that the TDD workflow automatically submits `presubmit-check` workflow via MCP `submit_run` tool.
    2. **Test 1.2 - Full Presubmit Wait**: After submitting `presubmit-check`, verify the workflow waits for ALL stages to reach terminal status (`Completed`, `Failed`, or `TimedOut`). Use mock MCP server to simulate stage state transitions.
    3. **Test 1.3 - assert_stage_output Calls**: Verify that the workflow calls `assert_stage_output` on EACH stage of the presubmit-check run, not just checking run status. Mock stage outputs and verify assertions are made.
    4. **Test 1.4 - Partial Pass Rejection**: Simulate a presubmit run where all stages reach `Completed` status but one `assert_stage_output` returns `{"passed": false}`. Verify the workflow:
        - Treats this as a task-level failure
        - Emits error: `PRESUBMIT_FAILED: Stage <stage_name> assertion failed - no commit allowed`
        - Does NOT mark the task as complete
        - Does NOT allow proceeding to next task
    5. **Test 1.5 - Successful Presubmit Flow**: Simulate a presubmit run where all stages pass assertions. Verify the workflow:
        - Emits info: `PRESUBMIT_PASSED: All stages completed and verified`
        - Marks task as complete
        - Allows proceeding to next task
    6. **Test 1.6 - No Partial Presubmit**: Attempt to run only a subset of presubmit stages (e.g., `./do test` only, skipping `./do lint`). Verify this is rejected with error: `PRESUBMIT_INCOMPLETE: Full presubmit-check required, partial passes not acceptable`.
- [ ] Use a mock MCP server that records all tool calls (`submit_run`, `get_run`, `assert_stage_output`) and their parameters.
- [ ] Verify the workflow polls `get_run` at correct intervals (500ms per [3_MCP_DESIGN-REQ-002]) until terminal status.

## 2. Task Implementation
- [ ] Implement the presubmit submitter in `crates/devs-cli/src/tdd/presubmit_submitter.rs`:
    - `submit_presubmit_check() -> Result<RunId, PresubmitError>` - calls MCP `submit_run` with workflow `presubmit-check`
    - `wait_for_completion(run_id: &RunId, timeout: Duration) -> Result<WorkflowRun, PresubmitError>` - polls `get_run` until terminal status
    - `PresubmitError` enum: `SubmissionFailed`, `Timeout`, `StageAssertionFailed { stage: String, failures: Vec<String> }`, `IncompleteStages`
- [ ] Implement the stage assertion runner in `crates/devs-cli/src/tdd/stage_assertion_runner.rs`:
    - `assert_all_stages(run_id: &RunId, mcp_client: &McpClient) -> Result<(), Vec<AssertionFailure>>` - calls `assert_stage_output` for each stage
    - `AssertionFailure` struct: `stage: String`, `predicate: String`, `actual_value: String`, `message: String`
    - Parse assertion response: `{"passed": bool, "failures": [...]}`
- [ ] Implement the presubmit workflow runner in `crates/devs-cli/src/tdd/presubmit_workflow.rs`:
    - `run_presubmit_sequence() -> Result<(), PresubmitError>` - orchestrates the full presubmit flow:
        1. Call `submit_presubmit_check()` → get `run_id`
        2. Call `wait_for_completion(run_id)` → get `WorkflowRun`
        3. Verify all stages reached terminal status
        4. Call `assert_all_stages(run_id)` → verify correctness
        5. If any assertion fails: emit error, return `PresubmitError::StageAssertionFailed`
        6. If all pass: emit success, return `Ok(())`
- [ ] Update the TDD Green stage completion in `crates/devs-cli/src/tdd/workflow.rs`:
    - After Green stage implementation passes locally:
        - Emit info: `GREEN_COMPLETE: Implementation written, tests passing - submitting presubmit-check`
        - Call `run_presubmit_sequence()`
        - If presubmit fails: emit error, block task completion
        - If presubmit passes: emit success, allow task completion
- [ ] Implement the partial presubmit detector in `crates/devs-cli/src/tdd/presubmit_detector.rs`:
    - `detect_partial_presubmit(command: &str) -> Result<bool>` - checks if command is a subset of full presubmit
    - If partial detected: emit error `PRESUBMIT_INCOMPLETE: Full presubmit-check required, partial passes not acceptable`
- [ ] Implement run status polling with configurable interval:
    - Default: 500ms polling interval (per [3_MCP_DESIGN-REQ-002])
    - Timeout: 30 minutes for full presubmit (configurable via env var `PRESUBMIT_TIMEOUT_MINUTES`)
    - Log progress every 30 seconds: `Presubmit check in progress... elapsed: 2m 30s`

## 3. Code Review
- [ ] Verify that the workflow waits for ALL stages, not just the first failure.
- [ ] Check that `assert_stage_output` is called for every stage, not skipped for "obvious" passes.
- [ ] Ensure the timeout handling is graceful (doesn't leave hanging runs).
- [ ] Verify that error messages clearly indicate which stage failed and why.
- [ ] Confirm that the workflow does NOT allow task completion after presubmit failure.
- [ ] Check that partial presubmit commands are correctly detected and rejected.
- [ ] Verify that the polling interval respects the 500ms maximum delay requirement.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-cli --test presubmit_enforcement_tests` to verify all behaviors.
- [ ] Manually test the TDD workflow:
    1. Complete Green stage → verify presubmit-check is submitted automatically
    2. Simulate presubmit success → verify task completion allowed
    3. Simulate presubmit failure (stage assertion fails) → verify task completion blocked
    4. Attempt partial presubmit (`./do test` only) → verify rejection
- [ ] Verify that the workflow correctly handles presubmit timeout (e.g., hung build).

## 5. Update Documentation
- [ ] Update `docs/agent_development.md` with the following sections:
    - "Green Stage Completion: Presubmit Requirement" - explain why full presubmit is required
    - "Presubmit-Check Workflow" - describe what stages are included and what they verify
    - "Stage Assertions" - explain how `assert_stage_output` works and what it checks
    - "Handling Presubmit Failures" - guide agents through diagnosing and fixing presubmit failures
- [ ] Add examples of error messages:
    - `PRESUBMIT_FAILED: Stage lint assertion failed - no commit allowed`
    - `PRESUBMIT_INCOMPLETE: Full presubmit-check required, partial passes not acceptable`
    - `PRESUBMIT_PASSED: All stages completed and verified`
- [ ] Document the presubmit stages and their expected outputs:
    - `build` - compiles workspace
    - `test` - runs unit tests
    - `lint` - runs clippy, fmt check
    - `coverage` - verifies coverage gates
    - `traceability` - verifies requirement coverage

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify all tests pass including the new presubmit enforcement tests.
- [ ] Run `./do lint` and verify no clippy warnings or formatting issues in the new code.
- [ ] Verify traceability: ensure all new test functions have `// Covers: 3_MCP_DESIGN-REQ-030` annotation.
- [ ] Run `./do coverage` and verify the new code achieves ≥90% unit coverage.
- [ ] Create an E2E test that simulates the full TDD Green→Presubmit workflow and verifies correct behavior.
- [ ] Verify that the E2E test achieves coverage through the CLI interface (counts toward 50% CLI E2E gate).
