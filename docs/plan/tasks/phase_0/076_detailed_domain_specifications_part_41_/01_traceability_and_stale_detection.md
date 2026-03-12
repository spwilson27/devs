# Task: Implement Traceability Generation and Stale ID Detection (Sub-Epic: 076_Detailed Domain Specifications (Part 41))

## Covered Requirements
- [2_TAS-REQ-455], [2_TAS-REQ-456]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a new test file `tests/test_traceability.py` (or extend existing traceability tests).
- [ ] Write a test that runs a mock version of the traceability scanner against a directory containing:
    - A mock `requirements.md` with a list of requirement IDs.
    - A mock Rust file with `// Covers: [REQ-ID]` annotations.
- [ ] Verify that:
    - When all IDs in `requirements.md` are covered by annotations, `target/traceability.json` is generated with `overall_passed: true` and empty `uncovered_ids`.
    - When an ID in `requirements.md` has no annotation, `overall_passed: false` and the ID appears in `uncovered_ids`.
    - When an annotation references an ID NOT in `requirements.md`, the scanner exits non-zero and the ID is reported as an error (and appears in `invalid_ids` or `uncovered_ids` per the requirement's literal wording).

## 2. Task Implementation
- [ ] Update `.tools/verify_requirements.py` to add a new command or mode (e.g., `--generate-traceability`) that:
    - Loads all requirement IDs from `requirements.md`.
    - Recursively scans the `crates/` and `tests/` directories for `// Covers: [ID]` or `/// Covers: [ID]` annotations in `.rs` files.
    - Compares the two sets.
    - Generates `target/traceability.json` with the following structure:
        ```json
        {
          "overall_passed": boolean,
          "requirements_count": number,
          "covered_count": number,
          "uncovered_ids": ["REQ-ID", ...],
          "invalid_ids": ["STALE-ID", ...],
          "coverage_map": {
            "REQ-ID": ["file_path:line_number", ...]
          }
        }
        ```
- [ ] Implement the exit-code logic:
    - Exit 0 only if `uncovered_ids` is empty AND `invalid_ids` is empty.
    - Exit non-zero if any IDs are missing coverage or if any stale/invalid IDs are referenced in code.
- [ ] Update the `./do` script's `cmd_test` function:
    - After running `pytest`, invoke the updated `verify_requirements.py` to generate the traceability report.
    - Ensure the exit code of `./do test` reflects the failure of traceability even if pytest passed.

## 3. Code Review
- [ ] Ensure the regex for `// Covers: [ID]` is robust and matches the project's annotation convention.
- [ ] Verify that the scanner is fast and doesn't significantly slow down `./do test`.
- [ ] Check that `target/` is used correctly for output and that the directory is created if it doesn't exist.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 tests/test_traceability.py`.
- [ ] Run `./do test` and verify `target/traceability.json` is created.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or internal developer docs to reflect the new traceability requirement for tests.

## 6. Automated Verification
- [ ] Run `python3 .tools/verify_requirements.py --generate-traceability` and verify it produces a valid JSON in `target/traceability.json`.
- [ ] Use a script to verify the JSON schema matches the expected format.
