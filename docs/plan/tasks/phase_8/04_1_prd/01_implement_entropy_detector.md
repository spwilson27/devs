# Task: Implement Entropy Detector Library (Sub-Epic: 04_1_PRD)

## Covered Requirements
- [1_PRD-REQ-REL-001]

## 1. Initial Test Written
- [ ] Create unit tests first using pytest at `tests/unit/test_entropy_detector.py`.
  - Tests to write (exact assertions):
    - test_compute_output_hash_is_stable:
      - input = "error: timeout"
      - assert compute_output_hash(input) == hashlib.sha256(input.encode('utf-8')).hexdigest()
      - assert calling compute_output_hash(input) twice returns identical strings
    - test_jaccard_similarity_identical_strings_returns_1:
      - a = "the error occurred"
      - b = "the error occurred"
      - assert jaccard_similarity(a, b) == 1.0
    - test_jaccard_similarity_different_strings_returns_0:
      - a = "timeout"
      - b = "syntax error"
      - assert jaccard_similarity(a, b) == 0.0
    - test_is_loop_detected_by_hashes:
      - history = ["errA", "errA", "errA"] (use their computed hashes)
      - new_text = "errA"
      - assert is_loop_detected(history, new_text, window=3) is True
    - test_is_loop_detected_by_similarity:
      - history_texts = ["fatal error at line 1", "fatal error at line 1", "fatal error at line 1"]
      - new_text = "fatal error at line 1"
      - assert is_loop_detected(history_texts, new_text, sim_threshold=0.95) is True

Provide concrete sample inputs and exact assertion expectations in the tests so an agent can write them verbatim.

## 2. Task Implementation
- [ ] Implement a small, well-documented Python module at `src/entropy_detector.py` with the following API and behavior (type hints required):
  - def compute_output_hash(output: str) -> str:
    - Returns the SHA-256 hex digest of `output.encode('utf-8')`.
  - def jaccard_similarity(a: str, b: str) -> float:
    - Tokenize on whitespace, lower-case tokens, compute Jaccard similarity = |A ∩ B| / |A ∪ B|. Return 0.0 if union empty.
  - def is_loop_detected(history_texts: List[str], new_text: str, window: int = 3, sim_threshold: float = 0.95) -> bool:
    - Behavior:
      1. Compute hashes for the last `window` entries of `history_texts` and the `new_text` using compute_output_hash.
      2. If all `window` hashes are exactly equal to the `new_text` hash, return True.
      3. Otherwise compute jaccard_similarity between `new_text` and each of the last `window` texts; if every similarity >= sim_threshold return True.
      4. Otherwise return False.
  - Expose constants DEFAULT_WINDOW = 3 and DEFAULT_SIM_THRESHOLD = 0.95.
- [ ] Add comprehensive docstrings and type hints for all functions.
- [ ] Keep implementation pure and deterministic (no network or randomness).

## 3. Code Review
- [ ] Verify the implementation meets these quality gates:
  - Functions are pure and small with single responsibility.
  - Type hints for all public functions and PEP8-compliant formatting.
  - No external side effects (no network, no disk writes) in pure functions.
  - Adequate docstrings with examples for each function.

## 4. Run Automated Tests to Verify
- [ ] Run the tests with: `python -m pytest tests/unit/test_entropy_detector.py -q` and ensure all tests pass.
- [ ] If tests fail, iterate: adjust implementation until tests pass.

## 5. Update Documentation
- [ ] Add `docs/entropy_detector.md` describing:
  - Public API (function signatures, param meanings, return values).
  - Design rationale (why Jaccard similarity used as a lightweight semantic fallback).
  - Configuration knobs (window size, similarity threshold) and recommended defaults.
  - Example usage snippet showing how DeveloperAgent should call `is_loop_detected`.

## 6. Automated Verification
- [ ] Add `scripts/verify_entropy_detector.sh` that:
  - Runs `pytest tests/unit/test_entropy_detector.py` and exits non-zero on any failure.
  - Runs a short smoke script that calls `is_loop_detected` with three identical strings and asserts a True result.
  - The CI pipeline should call this script as a sanity gate for the library.
