# Task: Implement EntropyDetector using SHA-256 (Sub-Epic: 15_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-REQ-012]

## 1. Initial Test Written
- [ ] Create unit tests at tests/test_entropy_detector.py that validate the hashing and detection behavior.
  - test_hash_stability: given a canonical output string (with explicit normalization steps documented in the test), assert hashlib.sha256(...) produces the expected hex digest.
  - test_detect_entropy_on_repeated_outputs: feed a sequence of identical normalized outputs across consecutive turns and assert EntropyDetector flags the repetition according to configured thresholds.
  - test_hash_canonicalization: varying whitespace, trailing newlines, and encoding must canonicalize to the same hash once normalization is applied.
  - Use fixtures to simulate minimal sandbox output objects; avoid network or file I/O.

## 2. Task Implementation
- [ ] Implement EntropyDetector in src/agents/entropy_detector.py:
  - Public API:
    - hash_output(output: str) -> str  -- returns sha256 hex digest after canonical normalization.
    - record_turn(task_id: str, turn_index: int, output: str) -> None -- computes hash and stores it in persistence.
    - is_entropy(task_id: str, window: int=3, threshold: int=3) -> bool -- returns True when identical hashes detected within configured window.
  - Normalization rules:
    - Trim leading/trailing whitespace, collapse multiple whitespace to single spaces, normalize newlines to "\n", use UTF-8 NFC normalization.
  - Persistence:
    - Lightweight SQLite table `entropy_hashes(task_id TEXT, turn_index INTEGER, hash TEXT, created_at TIMESTAMP)`.
    - Provide a small migration or DDL SQL file in db/migrations/ that creates the table.
  - Make the hashing implementation dependency-free (use Python stdlib hashlib) and fast.

## 3. Code Review
- [ ] Verify:
  - All normalization rules are exhaustively documented in code comments and tests.
  - Hashing uses sha256 from stdlib and encoding is explicit (utf-8).
  - The detector API is small, pure, and easily mockable for higher-level tests.

## 4. Run Automated Tests to Verify
- [ ] Run pytest -q tests/test_entropy_detector.py and ensure all assertions pass. If DB access is used, run against a temporary in-memory SQLite instance.

## 5. Update Documentation
- [ ] Add docs/entropy/detector.md documenting the canonicalization rules, schema for `entropy_hashes`, configuration knobs (window, threshold), and example hashes for sample outputs.

## 6. Automated Verification
- [ ] Add a short script tests/support/simulate_entropy.py that simulates N turns with repeated outputs, invokes EntropyDetector.record_turn, and asserts is_entropy flips to True within the expected number of turns.
