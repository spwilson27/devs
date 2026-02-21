# Task: Implement Entropy Detection module and unit tests (Sub-Epic: 20_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-080]

## 1. Initial Test Written
- [ ] Detect the repository's test runner and use it (search for package.json with "jest"/"mocha", pyproject.toml/setup.cfg with pytest). If none exists, default to pytest and add minimal configuration.
- [ ] Create a test file at tests/security/test_entropy_detector.py that imports the EntropyDetector from src/entropy/detector.py.
- [ ] Write three focused, fast unit tests:
  - test_compute_hash_deterministic: ensure compute_hash("error: X") returns the same SHA-256 hex digest when called twice.
  - test_entropy_trigger_after_repeats: instantiate EntropyDetector(repeat_threshold=3); push the same normalized output string three times and assert detector.triggered is True on or after the third push.
  - test_entropy_not_triggered_for_unique_outputs: push three different normalized outputs and assert detector.triggered is False.
- [ ] Tests must be deterministic, isolated, and fast (<5s); use tmp_path fixtures for any temp files.

## 2. Task Implementation
- [ ] Implement src/entropy/detector.py exposing an EntropyDetector class with the public API:
  - compute_hash(output: str) -> str  # returns lowercase hex sha256 digest after normalizing whitespace and truncating to 8KB
  - push(output: str) -> None         # records a normalized output and updates internal rolling buffer
  - triggered() -> bool               # returns whether repeat_threshold condition is met
  - reset() -> None                   # clears internal state
- [ ] Normalization rules: trim leading/trailing whitespace, collapse consecutive whitespace to single spaces, normalize line endings to "\n", and truncate to 8192 bytes before hashing.
- [ ] Use Python's hashlib.sha256 for hashing; ensure deterministic hex digest (hexdigest()).
- [ ] Keep implementation small and pure (no network or filesystem access during push/compute_hash).

## 3. Code Review
- [ ] Verify compute_hash uses sha256 and normalization rules are covered by unit tests (empty string, long string, whitespace-only string).
- [ ] Ensure public API is minimal and well-typed (type hints). Ensure no secrets or external calls.
- [ ] Confirm code has clear docstrings and small functions (<80 LOC per function).

## 4. Run Automated Tests to Verify
- [ ] Run the chosen test runner for tests/security (e.g., `pytest tests/security -q` or `npx jest tests/security`). The initial run (red phase) should FAIL after only writing tests if implementation is not present; after implementation re-run and confirm all tests pass.

## 5. Update Documentation
- [ ] Add a short note to docs/security/entropy.md describing the EntropyDetector API, normalization rules, thresholds, and where tests live.

## 6. Automated Verification
- [ ] Add scripts/verify_entropy_detector.sh that runs the repository test runner on tests/security and exits with 0 only if all tests pass and the EntropyDetector.triggered behavior matches the tests (used by CI). Ensure script is executable and documented in docs/security/entropy.md.
