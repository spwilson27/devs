# Task: Traceability Report Generator (Sub-Epic: 01_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-055]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Verification Infrastructure, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `tests/test_traceability_report.py` that asserts that the traceability tool correctly identifies requirement IDs from the spec files and verifies that they are covered in the code.
- [ ] Assert that the tool correctly produces `target/traceability.json` with the required schema on completion of `./do test`.

## 2. Task Implementation
- [ ] Implement or update `.tools/verify_requirements.py`:
    - Discovers all requirement IDs from `docs/plan/specs/*.md` (e.g., matching the pattern `\[([A-Z0-9_\-]+-REQ-[A-Z0-9_\-]+)\]`).
    - Scans the entire codebase for annotations matching those IDs (e.g., in test doc comments).
    - Verifies that the corresponding tests are passing (this might require reading a separate test result JSON).
    - Produces `target/traceability.json`:
        - `schema_version`: 1
        - `overall_passed`: boolean (true only if all requirements are covered and passing)
        - `traceability_pct`: decimal string representing `(covered_count / total_count) * 100.0`.
        - `requirements`: list of objects with `id`, `description`, `covered`, `pass_status`, and `stale`.
- [ ] Update `./do test` to invoke this generator at the end of the run.

## 3. Code Review
- [ ] Confirm that `target/traceability.json` is treated as the canonical checklist for the agent.
- [ ] Ensure that "stale" annotations (pointing to deleted code or missing requirements) are correctly identified.

## 4. Run Automated Tests to Verify
- [ ] Run the Python test: `pytest tests/test_traceability_report.py`.
- [ ] Run `./do test` and inspect `target/traceability.json`.

## 5. Update Documentation
- [ ] Add a note to `GEMINI.md` that `target/traceability.json` is the authoritative record for requirement coverage.
- [ ] Ensure the agent's "completion check" logic explicitly references this JSON file.

## 6. Automated Verification
- [ ] Verify that `overall_passed` is false if even one requirement is not annotated in the code.
- [ ] Verify that the `traceability_pct` calculation is accurate based on the discovered requirements.
