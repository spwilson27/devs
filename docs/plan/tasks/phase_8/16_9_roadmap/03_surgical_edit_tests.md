# Task: Add tests for surgical_edit tool (Sub-Epic: 16_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-TAS-206]

## 1. Initial Test Written
- [ ] Detect the repository test runner (see Task 01 pattern). Create tests under `tests/tools/test_surgical_edit.(py|js|ts)`.
- [ ] Write unit tests that cover these scenarios using small temporary fixture files (use tmp_path or tmpdir fixtures):
  - single contiguous block replacement: create a 10-line fixture file, apply an edit replacing lines 3..5, assert the resulting content matches expected.
  - multiple non-contiguous edits in one operation: apply edits at lines 2..2 and 8..9 and assert the final file matches the expected result.
  - overlapping edits validation: attempt to apply overlapping edits and assert the function raises a well-defined error (e.g., ValueError/CustomError) and leaves the original file untouched.
  - atomic write behaviour: simulate (or mock) a failure during write and assert the original file is not corrupted (use temporary file rename semantics in the test to validate atomicity).
  - permission and EOL preservation: ensure file permissions and line endings are preserved after edit.
- [ ] Keep tests isolated, platform-independent, and fast.

## 2. Task Implementation
- [ ] Only add the tests in this task (red). Import path should follow `src/tools/surgical_edit`.

## 3. Code Review
- [ ] Ensure tests assert the public library/CLI behaviour, include clear failure messages for debugging, and do not assume a specific implementation detail beyond the API contract.

## 4. Run Automated Tests to Verify
- [ ] Run the new tests with the repository test runner and confirm they are failing (red state) until implementation is provided.

## 5. Update Documentation
- [ ] Add `docs/tools_surgical_edit_tests.md` describing the tests, the fixtures used, and how to run them locally.

## 6. Automated Verification
- [ ] Add `scripts/verify_surgical_edit_tests.sh` that runs the surgical_edit tests and exits non-zero if they unexpectedly pass (ensures red-first TDD step is enforced).