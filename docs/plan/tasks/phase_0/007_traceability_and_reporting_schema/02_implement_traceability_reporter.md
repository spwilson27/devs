# Task: Implement Traceability Reporter and `./do test` Integration (Sub-Epic: 007_Traceability and Reporting Schema)

## Covered Requirements
- [2_TAS-REQ-079]

## Dependencies
- depends_on: [01_implement_traceability_scanner.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `tests/test_traceability_reporter.py` that:
    - Verifies mapping of found annotations against a list of valid requirements from `docs/plan/specs/1_prd.md`.
    - Verifies calculation of `traceability_pct`.
    - Verifies generation of `target/traceability.json` matching the schema in [2_TAS-REQ-079].
    - Verifies that the reporter exits non-zero if a `1_PRD-REQ-*` ID is missing from the code.
    - Verifies that the reporter exits non-zero if an annotation uses an ID not in the specs.

## 2. Task Implementation
- [ ] Implement `.tools/traceability_reporter.py` that consumes the scanner output.
- [ ] Extract valid requirement IDs from `docs/plan/specs/1_prd.md`.
- [ ] Correlate found annotations with valid IDs.
- [ ] Implement the JSON generation logic for `target/traceability.json`.
- [ ] Update `./do` script's `cmd_test()` to call this reporter after running `cargo test`.

## 3. Code Review
- [ ] Verify that the overall traceability percentage is correctly calculated.
- [ ] Ensure the reporter correctly identifies "Stale annotations" (IDs not in PRD) as required by [2_TAS-REQ-080].

## 4. Run Automated Tests to Verify
- [ ] Run `python3 -m pytest tests/test_traceability_reporter.py`.
- [ ] Run `./do test` in a scenario with missing requirements and verify it fails.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that `./do test` now enforces requirement traceability.

## 6. Automated Verification
- [ ] Verify the existence and content of `target/traceability.json` after a successful `./do test`.
