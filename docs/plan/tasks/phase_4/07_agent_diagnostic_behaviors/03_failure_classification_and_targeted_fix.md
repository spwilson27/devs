# Task: Implement Failure Classification & Targeted Fix Protocol (Sub-Epic: 07_Agent Diagnostic Behaviors)

## Covered Requirements
- [3_MCP_DESIGN-REQ-029], [3_MCP_DESIGN-REQ-030]

## Dependencies
- depends_on: [01_diagnostic_investigation_sequence.md]
- shared_components: [devs-mcp, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-cli/tests/diagnostic_tests.rs` for each of the eight failure categories:
    1. Compile Error (diagnosed by `stderr`).
    2. Test Failure (diagnosed by `cargo test` output and `target/traceability.json`).
    3. Coverage Failure (diagnosed by `target/coverage/report.json`).
    4. Clippy Warning (diagnosed by `stderr`).
    5. Traceability Failure (diagnosed by `target/traceability.json`).
    6. Timeout (diagnosed by `StageStatus::TimedOut`).
    7. Unclassified Internal (default case).
- [ ] Mock a `presubmit-check` failure and verify the classification result for each.
- [ ] Verify that an agent cannot proceed without a classified fix based on the investigation sequence.

## 2. Task Implementation
- [ ] Implement the classification logic in `crates/devs-cli/src/diagnose/classification.rs` as defined in §4.1 of the Glass-Box design.
- [ ] Parse `target/coverage/report.json` to extract `delta_pct`, `uncovered_lines`, and `total_lines` for coverage diagnosis.
- [ ] Parse `target/traceability.json` to identify exactly which requirement IDs are missing coverage.
- [ ] Enforce the "No Speculative Edits" rule ([3_MCP_DESIGN-REQ-035]) by gating code write access until a classification is confirmed and stored in the session state.
- [ ] Implement the logic to verify that a test is genuinely failing (exit code 1) before allowing implementation (REQ-029 in Phase 4 summary).

## 3. Code Review
- [ ] Ensure that the classification tool provides specific, actionable instructions rather than vague summaries (per §4.1).
- [ ] Verify that the tool follows the progressive context narrowing algorithm for source reading (REQ-NEW-025).
- [ ] Confirm that all failures are logged with stable prefixes for automated response ([3_MCP_DESIGN-REQ-AC-4.09]).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test diagnostic_tests` to verify the classification accuracy.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` to record the stable classification prefixes.

## 6. Automated Verification
- [ ] Run `./do test --package devs-cli` and ensure all diagnostic tests pass.
