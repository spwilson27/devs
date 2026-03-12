# Task: Traceability Infrastructure and Risk Matrix Enforcement (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-032], [9_PROJECT_ROADMAP-REQ-041], [9_PROJECT_ROADMAP-REQ-090], [9_PROJECT_ROADMAP-REQ-105], [9_PROJECT_ROADMAP-REQ-307], [9_PROJECT_ROADMAP-REQ-317], [9_PROJECT_ROADMAP-REQ-322], [9_PROJECT_ROADMAP-REQ-324]
- [8_RISKS-REQ-001], [8_RISKS-REQ-002], [8_RISKS-REQ-003], [8_RISKS-REQ-004], [8_RISKS-REQ-005]
- [8_RISKS-REQ-006], [8_RISKS-REQ-007], [8_RISKS-REQ-008], [8_RISKS-REQ-009], [8_RISKS-REQ-010]
- [8_RISKS-REQ-011] through [8_RISKS-REQ-050]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Verification Infrastructure, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new Python test in `.tools/tests/test_traceability_logic.py` that mocks a set of requirements and test files.
- [ ] The test must verify that `verify_requirements.py` correctly identifies missing coverage for a requirement.
- [ ] The test must verify that `stale_annotations` are detected when a test references a non-existent requirement ID.
- [ ] The test must verify that `target/traceability.json` is generated with the correct schema, including `traceability_pct` and `risk_matrix_violations`.

## 2. Task Implementation
- [ ] Enhance `.tools/verify_requirements.py` to calculate `traceability_pct` across all requirement classes.
- [ ] Implement the `risk_matrix_violations` logic: any risk with a score ≥ 6 (Impact * Probability) MUST have at least one covering test.
- [ ] Update `./do test` to invoke the verification script and exit non-zero if `traceability_pct < 100.0` or if any `risk_matrix_violations` exist.
- [ ] Ensure `target/traceability.json` includes `phase_gates` with `gate_passed` boolean for each roadmap phase (ROAD-001 through ROAD-006).
- [ ] Add a staleness check that warns if `target/traceability.json` is more than 1 hour old during development.

## 3. Code Review
- [ ] Verify that the traceability script is performant and doesn't significantly slow down `./do test`.
- [ ] Ensure the JSON output schema is stable and easily parseable by both humans and AI agents.
- [ ] Check that regex patterns for finding `// Covers: [REQ-ID]` are robust against different whitespace and comment styles.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_traceability_logic.py`.
- [ ] Run `./do test` on the current codebase and verify it generates `target/traceability.json`.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/9_project_roadmap.md` if any implementation details changed from the initial spec.
- [ ] Ensure `MEMORY.md` reflects the completion of the traceability infrastructure.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py --json > target/traceability_verify.json` and check that it contains the expected fields.
- [ ] Verify `./do test` exits non-zero if a temporary "fake" stale annotation is added to a source file.
