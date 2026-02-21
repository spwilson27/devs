# Task: Add unit tests for EntropyDetector (Sub-Epic: 16_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-TAS-604]

## 1. Initial Test Written
- [ ] Detect the repository's test runner and use it (search for package.json with "jest"/"mocha", pyproject.toml/setup.cfg with pytest). If none exists, default to pytest and add a minimal test runner configuration.
- [ ] Create a new test file at tests/entropy/test_entropy_detector.(py|js|ts) that imports the EntropyDetector from src/entropy/detector.(py|js|ts).
- [ ] Write three focused, fast unit tests:
  - test_hash_is_deterministic: call compute_hash("error: X") twice and assert the hex digest is identical.
  - test_repeat_detection_triggers_at_threshold: instantiate EntropyDetector with repeat_threshold=3, push the identical output string three times and assert detector reports triggered==True on or after the 3rd push.
  - test_nonrepeat_does_not_trigger: push three different outputs and assert detector reports triggered==False.
- [ ] Keep tests deterministic, isolated, file-system-only, and fast (<5s).

## 2. Task Implementation
- [ ] Only implement the tests in this task (red phase). Do NOT change production code yet. Import path should match the project layout: prefer src/entropy/detector.*. Use small fixtures created in a tmp directory (tmp_path fixture in pytest or tempdir in Jest).

## 3. Code Review
- [ ] Verify tests only exercise the public API (EntropyDetector.push / compute_hash), have clear names, do not depend on external services, and include edge cases (empty string, very long output, whitespace normalization).

## 4. Run Automated Tests to Verify
- [ ] Run the repository test runner for just these tests (e.g., `pytest tests/entropy -q` or `npx jest tests/entropy --runTestsByPath`). Confirm tests FAIL (red) because production implementation is not present yet.

## 5. Update Documentation
- [ ] Add a short note to docs/phase_8/16_9_entropy_tests.md describing the added tests, their location, how to run them, and the intended red/green workflow.

## 6. Automated Verification
- [ ] Add scripts/verify_entropy_tests.sh that runs the chosen test runner on tests/entropy and exits with code 0 only if all tests are present and at least one test fails (i.e., confirms "red" state). This script will be used by CI to confirm the test-first state.
