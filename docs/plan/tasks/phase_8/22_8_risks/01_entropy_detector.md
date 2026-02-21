# Task: Implement Deterministic Entropy Detector (Sub-Epic: 22_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-002]

## 1. Initial Test Written
- [ ] Add unit tests that validate SHA-256-based output hashing and repeat-detection behavior before any implementation changes:
  - Tests to write FIRST:
    - test_hash_consistency: given two identical output strings ("OUT1", "OUT1"), assert the detector's hash function returns identical SHA-256 hex digests.
    - test_detect_repeat_threshold: feed the detector three identical normalized outputs in sequence and assert push_and_check(...) returns flagged==True with reason containing "repeat" (use the configured repeat threshold=3).
    - test_no_false_positive_on_similar_outputs: feed slightly different outputs (e.g., "OUT1\nTS=123" vs "OUT1\nTS=124") when normalization is enabled, assert not flagged unless normalization removes the difference.
  - Exact test locations (pick the repo's primary test runner):
    - If pytest exists: create `tests/test_entropy_detector.py` with the three tests and deterministic inputs.
    - If Jest exists: create `tests/entropy-detector.test.ts` with equivalent tests.
  - Test expectations: deterministic inputs, no external network, no randomness, tests must run in isolation and pass on a clean workspace.

## 2. Task Implementation
- [ ] Implement a deterministic EntropyDetector module with the following clear requirements and API for easy testing and integration:
  - Module path suggestions (select appropriate language by repo conventions): `src/entropy/entropy_detector.py` (Python) or `packages/entropy/src/entropyDetector.ts` (TypeScript).
  - Public API:
    - class EntropyDetector(history_size: int = 10, repeat_threshold: int = 3, normalize: bool = True)
    - hash_output(output: str) -> str  # returns SHA-256 hex digest of the normalized output
    - push_and_check(output: str) -> { flagged: bool, reason: str }  # pushes to history, returns whether a repeat-loop is detected
    - reset()
  - Implementation details:
    - Use the platform-standard SHA-256 implementation (Python: hashlib.sha256(...).hexdigest(); Node: crypto.createHash('sha256').update(...).digest('hex')).
    - Normalization: remove known non-deterministic tokens (timestamps, UUIDs) using regexes configurable via ENTROPY_NORMALIZERS list; trim whitespace; optionally sort lines if config NORMALIZE_SORT_LINES is true.
    - History: maintain a fixed-size ring buffer of the last `history_size` hashes in memory; push_and_check should compare the new hash against the last `repeat_threshold` entries.
    - Determinism: avoid any randomness; no time or environment-dependent logic in hashing.
    - Integration hooks: expose a small adapter to persist history to the agent memory store (MemoryAdapter.save(task_id, key, value)) but default to in-memory for tests.
  - Configuration: expose `ENTROPY_HISTORY_SIZE`, `ENTROPY_REPEAT_THRESHOLD`, and `ENTROPY_NORMALIZERS` in project config (e.g., config/entropy.yaml) with sane defaults.

## 3. Code Review
- [ ] Verify the implementation meets these criteria during code review:
  - Uses deterministic SHA-256 hashing and a clear normalization pipeline (regexes documented).
  - Public API matches the spec above and is well-documented with type hints or JSDoc.
  - No use of randomness, time-based salts, or environment-dependent hashing.
  - Unit tests cover positive, negative and edge cases and run quickly (< 1s each).
  - Complexity: push_and_check should be O(1) amortized (ring buffer operations), and memory bounded by history_size.

## 4. Run Automated Tests to Verify
- [ ] Run the unit tests and ensure they pass locally and in CI:
  - If pytest: `pytest -q tests/test_entropy_detector.py` and expect exit code 0 and summary indicating all tests passed.
  - If Jest: `npx jest tests/entropy-detector.test.ts --runInBand --silent`.
  - Add the test command to CI as a gate for the task.

## 5. Update Documentation
- [ ] Add `docs/risks/entropy_detector.md` that documents:
  - Purpose: deterministic entropy detection for terminal/output loops.
  - Configuration variables and defaults: ENTROPY_HISTORY_SIZE, ENTROPY_REPEAT_THRESHOLD, ENTROPY_NORMALIZERS.
  - Examples of normalization regexes and examples showing inputs that should and should not be flagged.
  - How to integrate with Agent MemoryAdapter and how to persist history for long-lived tasks.

## 6. Automated Verification
- [ ] Add a verification script `scripts/verify_entropy_detector.sh` that:
  - Runs the unit tests for the module.
  - Runs a small simulation that feeds three identical normalized outputs into the detector and prints a machine-parseable JSON line `{ "detected": true }` on success.
  - CI should call this script and fail the job if it returns non-zero or `detected` is not true.
