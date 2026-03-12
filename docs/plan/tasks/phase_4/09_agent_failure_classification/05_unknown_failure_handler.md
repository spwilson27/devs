# Task: Implement Unknown Failure Classification (Sub-Epic: 09_Agent Failure Classification)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-018]

## Dependencies
- depends_on: [01_coverage_gate_failure.md, 02_clippy_denial_failure.md, 03_traceability_failure.md, 04_process_timeout_failure.md]
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-cli/src/diagnose/classification.rs` that mocks a `StageOutput` with an exit code of 1 and generic `stderr` that doesn't match any known pattern.
- [ ] Assert that the classifier returns `FailureClassification::Unknown`.
- [ ] Write an E2E test that induces a new type of failure (e.g., an OS-level signal like SIGKILL) and verify the classification fallback to "Unknown".

## 2. Task Implementation
- [ ] Add the `Unknown` variant to the `FailureClassification` enum.
- [ ] Finalize the `classify_failure` function as the dispatcher that calls all other specialized classifiers.
- [ ] Implement the fallback logic: if no rules (compile, test, coverage, clippy, traceability, timeout, rate limit, disk full) match, return `FailureClassification::Unknown`.
- [ ] For `Unknown` failures, include instructions to call `get_pool_state` to rule out infrastructure issues and to file a bug report manually before attempting any code fix ([3_MCP_DESIGN-REQ-DBG-BR-000]).

## 3. Code Review
- [ ] Verify that the classifier correctly identifies "Unknown" failures only after exhausting all other categories.
- [ ] Ensure that the fallback response matches the §4.1 protocol for internal/generic errors.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-cli --lib diagnose::classification` and verify all 8 categories (including the 5 in this sub-epic) are handled correctly.
- [ ] Run `cargo test --test diagnostic_loop_tests` for the full dispatcher check.

## 5. Update Documentation
- [ ] Add doc comments explaining the "Unknown" fallback logic and its alignment with the §4.1 Exhaustive Table rule.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the unknown classification test passes.
- [ ] Verify traceability for `[3_MCP_DESIGN-REQ-BR-018]`.
