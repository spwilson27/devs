# Task: Stale Requirement Reference Detection (Sub-Epic: 038_Detailed Domain Specifications (Part 3))

## Covered Requirements
- [1_PRD-KPI-BR-012]

## Dependencies
- depends_on: [01_authoritative_tag_extraction.md]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create an integration test in `tests/test_traceability_stale_detection.py` that:
    - Creates a temporary test file containing a reference to a non-existent requirement ID (e.g., `// Covers: 1_PRD-REQ-999`).
    - Runs the traceability scanner and verifies that it exits with a non-zero status.
    - Asserts that the error output specifically identifies the stale ID and the file/line where it was found.

## 2. Task Implementation
- [ ] Extend the traceability scanner's logic to collect all `req_id`s found in source code or tests (matching `Covers: 1_PRD-REQ-\d+`).
- [ ] Cross-reference this list of used IDs against the authoritative list extracted from the PRD in Task 1.
- [ ] Implement reporting for any ID found in code but absent from the authoritative list.
- [ ] Ensure that detection of a stale reference triggers a non-zero exit for `./do test`.

## 3. Code Review
- [ ] Verify that the check is exhaustive across all supported files (.rs, .sh, .py).
- [ ] Ensure the error message is actionable and clear.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 -m pytest tests/test_traceability_stale_detection.py`.

## 5. Update Documentation
- [ ] Document the "stale reference" rule for developers in the project's contributor guide.

## 6. Automated Verification
- [ ] Deliberately add a stale reference to a test file and verify that `./do test` fails during presubmit.
