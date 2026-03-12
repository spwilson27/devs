# Task: 100% Requirement Traceability Gate (Sub-Epic: 039_Detailed Domain Specifications (Part 4))

## Covered Requirements
- [1_PRD-REQ-053]

## Dependencies
- depends_on: [none]
- shared_components: ["Traceability & Verification Infrastructure"]

## 1. Initial Test Written
- [ ] Create a simulation in `tests/test_traceability_gate.py` that:
    - Defines a mock requirement file with 3 requirement IDs.
    - Scans a mock codebase where only 2 of those IDs are covered by `// Covers: REQ-ID` annotations.
    - Runs the traceability scanner and ensures it reports "Traceability Gate FAILED: 66.7% < 100.0%" and exits non-zero [1_PRD-REQ-053].
    - Verifies that a `// Covers:` annotation in a non-test source file (e.g., a production source file) is valid and counted toward traceability, but NOT toward E2E coverage gates [RISK-013-BR-004].

## 2. Task Implementation
- [ ] Update the `verify_requirements.py` traceability scanner (from sub-epic 007) to:
    - Parse ALL requirement IDs from the normative PRD and TAS documents [1_PRD-REQ-053].
    - Map them against all `// Covers:` annotations found in the `.rs` files across the workspace.
    - Implement a strict gate that requires `traceability_pct == 100.0` [9_PROJECT_ROADMAP-REQ-002].
- [ ] Ensure the scanner reports the list of uncovered requirements [9_PROJECT_ROADMAP-REQ-028].
- [ ] Integrate this gate as a mandatory check in `./do coverage` and `./do presubmit`.
- [ ] Ensure that a `0.0%` result or missing scanner output causes an immediate failure [1_PRD-KPI-BR-001].

## 3. Code Review
- [ ] Verify that the parser for requirement IDs is robust and captures all ID formats (e.g., `[1_PRD-REQ-001]`).
- [ ] Ensure the scanner traverses all crates and files within the workspace.
- [ ] Verify that the traceability gate cannot be bypassed by waiving individual requirements.

## 4. Run Automated Tests to Verify
- [ ] Run the simulation test script `tests/test_traceability_gate.py`.
- [ ] Run `python3 .tools/verify_requirements.py` on the current workspace and ensure all current requirements are correctly mapped.

## 5. Update Documentation
- [ ] Document the traceability requirement (`// Covers:` annotation) in the project developer guide.

## 6. Automated Verification
- [ ] Run `./do coverage` and verify that the output report contains a `traceability_pct` field and that it is `100.0`.
