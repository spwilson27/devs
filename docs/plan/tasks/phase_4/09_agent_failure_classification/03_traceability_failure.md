# Task: Implement Traceability Failure Classification (Sub-Epic: 09_Agent Failure Classification)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-011]

## Dependencies
- depends_on: [01_coverage_gate_failure.md]
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-cli/src/diagnose/classification.rs` that mocks a `StageOutput` with a failing traceability report in `structured` JSON.
- [ ] The mock JSON should have: `{"traceability": {"overall_passed": false, "missing_ids": ["[3_MCP_DESIGN-REQ-034]"]}}`.
- [ ] Assert that the classifier returns `FailureClassification::TraceabilityFailure`.
- [ ] Write an E2E test in `tests/e2e/diagnostic_loop_tests.rs` that submits a run with code missing mandatory requirement annotations.

## 2. Task Implementation
- [ ] Add the `TraceabilityFailure` variant to the `FailureClassification` enum.
- [ ] Extend `classify_failure` to parse the `traceability` field in the `structured` output.
- [ ] Implement logic to detect when `overall_passed` is false and extract the list of missing requirement IDs.
- [ ] Integrate a path resolver to find `target/traceability.json` to assist the agent in its response strategy.

## 3. Code Review
- [ ] Ensure the classifier handles cases where the traceability report is partially missing or has unexpected schema.
- [ ] Verify that the classification result provides the exact list of missing IDs for targeted annotation.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-cli --lib diagnose::classification` to verify the traceability detection logic.
- [ ] Run `cargo test --test diagnostic_loop_tests` for the E2E case.

## 5. Update Documentation
- [ ] Add doc comments explaining the detection rule (`structured.traceability.overall_passed == false`).

## 6. Automated Verification
- [ ] Run `./do test` and verify that the traceability classification test passes.
- [ ] Verify traceability for `[3_MCP_DESIGN-REQ-BR-011]`.
