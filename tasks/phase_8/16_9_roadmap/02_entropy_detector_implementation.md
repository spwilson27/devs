# Task: Implement EntropyDetector (SHA-256 comparison) (Sub-Epic: 16_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-TAS-604]

## 1. Initial Test Written
- [ ] Ensure tests from `01_entropy_detector_tests.md` exist and are failing (red). If the test runner detection step added config, ensure tests run under the chosen runner.

## 2. Task Implementation
- [ ] Implement `EntropyDetector` in `src/entropy/detector.(py|js|ts)` with the following API and behaviour:
  - Constructor parameters: `window_size` (default 10), `repeat_threshold` (default 3), and `normalize` (default true).
  - `compute_hash(output: str) -> str`: normalize the output (strip timestamps, collapse whitespace, trim), encode as UTF-8, compute SHA-256, return lowercase hex digest using the platform standard crypto library (hashlib in Python or crypto in Node).
  - `push(output: str) -> {hash: str, count: int, triggered: bool}`: compute hash, append to a fixed-size circular buffer (length `window_size`), count occurrences of this hash in the buffer, and set `triggered = (count >= repeat_threshold)`.
  - Thread/process-safety: document usage constraints; if project is multi-threaded, protect internal buffer with a mutex; otherwise simple in-memory structure is acceptable.
  - Optional debug persistence: add an opt-in sqlite table `entropy_hashes(timestamp INTEGER, hash TEXT)` and insert each computed hash for debugging (do not enable by default).
- [ ] Add configuration defaults in `config/entropy.yml` or the project's chosen config mechanism (document the config keys and default values).
- [ ] Add a small CLI for manual testing `scripts/entropy_cli.(py|js)` that reads STDIN lines, feeds them to EntropyDetector.push(), and prints `TRIGGERED` when threshold is reached.

## 3. Code Review
- [ ] Verify use of standard crypto primitives (no custom hashing). Confirm normalization rules are clearly documented and edge cases tested (empty output, binary data, very large outputs).
- [ ] Validate numerical limits (window_size <= 1000 recommended) and ensure memory usage is bounded and O(window_size).
- [ ] Confirm tests from Task 01 now pass and add unit tests for normalization and sqlite persistence (if implemented).

## 4. Run Automated Tests to Verify
- [ ] Run the project's full test suite (e.g., `pytest` or `npm test`) and ensure all tests pass, particularly the EntropyDetector tests.

## 5. Update Documentation
- [ ] Create `docs/entropy_detector.md` with: a concise algorithm description, configuration keys and defaults, API examples (code snippets showing using `EntropyDetector.push()`), and integration notes for where DeveloperAgent should call it (e.g., in the verification step of a task turn).

## 6. Automated Verification
- [ ] Add `scripts/verify_entropy_detector.py` that:
  - Instantiates `EntropyDetector(repeat_threshold=3)`
  - Calls `push("SAME ERROR\n")` three times
  - Prints JSON to stdout: `{"status":"triggered","count":3,"hash":"<hex>"}` and exits 0 only if `triggered` is true.

This script will be run by CI to programmatically confirm the detector is functioning.