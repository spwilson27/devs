# Task: Traceability Final Verification (Sub-Epic: 03_Core Quality Gates)

## Covered Requirements
- [AC-ROAD-P5-002]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a unit test in `.tools/tests/test_traceability_report.py` that verifies the structure and content of the generated `target/traceability.json`.
- [ ] The test should mock a repository state with 100% requirement coverage and zero stale annotations and verify that the output JSON matches the specified requirements.
- [ ] It should also verify that if any requirement is missing or any annotation is stale, `overall_passed` is false.

## 2. Task Implementation
- [ ] Update the `cmd_test` function in the `./do` script to:
  - Run the test suite using `pytest`.
  - After the tests complete, invoke the traceability verification tool: `.tools/verify_requirements.py --json-output target/traceability.json`.
  - Ensure the `./do test` command exits with a non-zero status if `traceability_pct < 100.0` or `stale_annotations` is not empty.
- [ ] Fix any remaining `stale_annotations` or missing requirement mappings in the codebase.
- [ ] Ensure `target/traceability.json` contains `traceability_pct == 100.0`, `stale_annotations: []`, and `overall_passed: true`.

## 3. Code Review
- [ ] Verify that every requirement ID in `requirements.md` is covered by at least one test.
- [ ] Ensure that the `overall_passed` flag is correctly calculated by the traceability script.
- [ ] Check that the output format is consistent with the roadmap requirement.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` in the project root.
- [ ] Confirm `target/traceability.json` is created and matches the expected values.
- [ ] Verify that the command exits with code 0.

## 5. Update Documentation
- [ ] Update `MEMORY.md` to reflect the final traceability state.
- [ ] Ensure any remaining "bootstrap" or "stub" requirement annotations are resolved.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` manually and confirm it reports 100% coverage and zero stale annotations.
- [ ] Confirm that `AC-ROAD-P5-002` is now verified by the new traceability check.
