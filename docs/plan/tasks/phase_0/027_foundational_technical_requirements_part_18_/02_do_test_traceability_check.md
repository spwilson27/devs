# Task: Implement `./do test` Traceability Check (Sub-Epic: 027_Foundational Technical Requirements (Part 18))

## Covered Requirements
- [2_TAS-REQ-014F]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a test Rust crate `test_traceability` with a single test containing `// Covers: 2_TAS-REQ-999`.
- [ ] Create a mockup `docs/plan/specs/2_tas.md` (or use the existing one) that includes `[2_TAS-REQ-999]`.
- [ ] Run the traceability scan and assert that it correctly identifies the mapping.
- [ ] Add a test for a stale reference (an annotation for a non-existent ID) and assert it causes a non-zero exit.
- [ ] Add a test for an uncovered requirement (present in spec but missing in code) and assert it causes a non-zero exit.

## 2. Task Implementation
- [ ] Modify the `./do test` subcommand to execute a traceability check script (e.g., `.tools/verify_traceability.py`) after running tests.
- [ ] The traceability check MUST:
    - Recursively scan `src/` and `tests/` for `// Covers: (1_PRD|2_TAS)-REQ-\d+`.
    - Scan `docs/plan/specs/1_prd.md` and `docs/plan/specs/2_tas.md` for `\[(1_PRD|2_TAS)-REQ-\d+\]`.
    - Calculate coverage metrics.
    - Write the result to `target/traceability.json` using the schema defined in `[2_TAS-REQ-014F]`.
    - Exit non-zero if `traceability_pct < 100.0` or if stale references are found.

## 3. Code Review
- [ ] Ensure the regex patterns for requirement IDs are robust and match the specification.
- [ ] Verify that `target/traceability.json` includes all mandatory fields.
- [ ] Confirm that the exit code behavior is correct for all failure scenarios (stale IDs, missing coverage).

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` on the entire workspace and check if `target/traceability.json` is generated correctly.
- [ ] Verify that the traceability check is executed automatically after the test suite.

## 5. Update Documentation
- [ ] Update documentation regarding the mandatory use of `// Covers:` comments for all implemented features and tests.

## 6. Automated Verification
- [ ] Verify that `target/traceability.json` is generated and that the exit code of `./do test` reflects the results of the traceability check.
