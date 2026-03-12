# Task: Implement Traceability Annotation Scanner (Sub-Epic: 007_Traceability and Reporting Schema)

## Covered Requirements
- [2_TAS-REQ-080]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test suite `tests/test_traceability_scanner.py` that:
    - Verifies detection of `// Covers: 1_PRD-REQ-001` in `.rs` files.
    - Verifies detection of `#[doc = "Covers: 1_PRD-REQ-002"]` in `.rs` files.
    - Verifies that multiple annotations in a single file are all captured.
    - Verifies that annotations on both functions and structs are captured.

## 2. Task Implementation
- [ ] Implement `.tools/traceability_scanner.py` (or as a module) with a robust regex to find both comment-style and attribute-style annotations.
- [ ] The scanner should return a list of found requirement IDs and their locations (file, line number).
- [ ] Support recursive directory walking for `src/` and `tests/`.

## 3. Code Review
- [ ] Ensure the regex correctly handles whitespace and variations in the annotation format.
- [ ] Verify that it does not pick up requirement IDs in regular text (must be prefixed by "Covers: ").

## 4. Run Automated Tests to Verify
- [ ] Run `python3 -m pytest tests/test_traceability_scanner.py`.

## 5. Update Documentation
- [ ] Update `.tools/README.md` to document the supported annotation formats.

## 6. Automated Verification
- [ ] Create a dummy `.rs` file with annotations, run the scanner, and verify the output matches expectations.
