# Task: Implement Clippy Denial Classification (Sub-Epic: 09_Agent Failure Classification)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-010]

## Dependencies
- depends_on: [01_coverage_gate_failure.md]
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-cli/src/diagnose/classification.rs` that mocks a `StageOutput` with `stderr` containing a typical `clippy` error pattern.
- [ ] The mock `stderr` should have: `error: aborting due to 1 previous error; clippy error: this loop could be rewritten with a for loop`.
- [ ] Assert that the classifier returns `FailureClassification::ClippyDenial`.
- [ ] Write an E2E test that submits a run with a deliberate clippy lint violation and verifies this classification.

## 2. Task Implementation
- [ ] Add the `ClippyDenial` variant to the `FailureClassification` enum if not already present.
- [ ] Extend the `classify_failure` function to scan `stderr` for patterns matching `error:` and the string `"clippy"`.
- [ ] Implement a regex parser to extract the filename and line number from the clippy diagnostic line (e.g., `src/lib.rs:42:5`).
- [ ] Update the classification result to include the identified file location for targeted editing by the agent.

## 3. Code Review
- [ ] Ensure the regex is resilient to different formatting or color codes if not stripped.
- [ ] Verify that it does not confuse generic rustc errors with clippy denials (look for the "clippy" tag).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-cli --lib diagnose::classification` to verify the clippy detection logic.
- [ ] Run `cargo test --test diagnostic_loop_tests` for the E2E case.

## 5. Update Documentation
- [ ] Add doc comments explaining the clippy detection rule (`stderr` pattern matching).

## 6. Automated Verification
- [ ] Run `./do test` and verify that the clippy classification test passes.
- [ ] Verify traceability for `[3_MCP_DESIGN-REQ-BR-010]`.
