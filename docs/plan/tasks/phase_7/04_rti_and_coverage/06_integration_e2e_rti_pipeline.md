# Task: Add integration and E2E tests for full RTI pipeline (Sub-Epic: 04_RTI_And_Coverage)

## Covered Requirements
- [9_ROADMAP-REQ-030], [8_RISKS-REQ-102]

## 1. Initial Test Written
- [ ] Create tests/e2e/test_rti_pipeline.py (pytest) that performs a full in-memory run of the pipeline:
  - Step 1: Load or create 5 example requirements (with source_location pointing to sample files in tests/fixtures/specs/).
  - Step 2: Create 5 tasks and link them such that 4 requirements are covered and 1 is not.
  - Step 3: Run the RTI validator CLI (invoke the validate_rti entrypoint) and assert it returns failure and prints the uncovered requirement with source_location.

## 2. Task Implementation
- [ ] Provide fixtures under tests/fixtures/ that include minimal sample spec files (small markdown snippets) and unit-level fixtures for requirements and tasks.
  - Implement any adapters needed to let the E2E test run entirely in-memory (test DB), using temporary directories (tmp_path fixture) for any file-based source_location references.
  - Ensure the pipeline uses the same src.services.rti_linker, src.analysis.rti_calculator, and src.validation.rti_validator modules (integration of components).

## 3. Code Review
- [ ] Verify the E2E test:
  - Is fast (< 10s) and deterministic.
  - Cleans up any temporary files and test DB instances.
  - Asserts both machine-readable JSON output and human-readable text that includes uncovered requirement IDs with source_location (important for [8_RISKS-REQ-102]).

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/e2e/test_rti_pipeline.py -q

## 5. Update Documentation
- [ ] Add docs/metrics/rti_e2e.md with the pipeline diagram (mermaid) and an example run output showing a failing and passing run.

## 6. Automated Verification
- [ ] Add this E2E test to a nightly CI job and to the merge gate only as a fast-smoke check; if it fails, produce an artifact log with failing requirement IDs and source_location.
