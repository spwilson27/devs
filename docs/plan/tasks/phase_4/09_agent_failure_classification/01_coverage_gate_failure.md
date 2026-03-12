# Task: Implement Coverage Gate Failure Classification (Sub-Epic: 09_Agent Failure Classification)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-009]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-cli/src/diagnose/classification.rs` (create file if missing) that mocks a `StageOutput` with a failing coverage gate.
- [ ] The mock output should have `structured` JSON containing `{"gates": [{"name": "unit", "passed": false, "actual_pct": 85.0, "threshold_pct": 90.0}]}`.
- [ ] Assert that the classifier returns `FailureClassification::CoverageFailure`.
- [ ] Write an E2E test in `tests/e2e/diagnostic_loop_tests.rs` that submits a run designed to fail its coverage gate and asserts the agent receives this classification.

## 2. Task Implementation
- [ ] Define the `FailureClassification` enum in `crates/devs-cli/src/diagnose/classification.rs`.
- [ ] Implement a `classify_failure` function that accepts `StageOutput` and returns `FailureClassification`.
- [ ] Implement the `CoverageFailure` detection logic:
    - Parse the `structured` field as JSON.
    - Check if any entry in the `gates` array has `passed: false`.
    - Extract the gate name and the delta (threshold - actual).
- [ ] Implement a helper to locate `target/coverage/report.json` relative to the workspace root to aid the agent in its response strategy.

## 3. Code Review
- [ ] Ensure the JSON parsing is robust and handles missing or malformed `structured` output gracefully (fallback to generic error).
- [ ] Verify that the classification result includes the name of the failing gate for targeted reporting.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-cli --lib diagnose::classification` to verify the unit test.
- [ ] Run `cargo test --test diagnostic_loop_tests` to verify the E2E behavior.

## 5. Update Documentation
- [ ] Add doc comments to the `FailureClassification` enum explaining the detection criteria for coverage failures.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the new coverage classification tests are counted and pass.
- [ ] Verify traceability via `target/traceability.json` for `[3_MCP_DESIGN-REQ-BR-009]`.
