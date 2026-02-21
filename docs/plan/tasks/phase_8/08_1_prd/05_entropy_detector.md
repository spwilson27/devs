# Task: Implement EntropyDetector (SHA-256-based) (Sub-Epic: 08_1_PRD)

## Covered Requirements
- [1_PRD-REQ-IMP-005]

## 1. Initial Test Written
- [ ] Write unit tests for hashing and repetition detection:
  - Tests for normalize_output which should trim, collapse consecutive whitespace, and canonicalize JSON (sort keys) when input is valid JSON.
  - Tests for hash_output that return deterministic SHA-256 hex for normalized content.
  - Tests for detect_repetition(history_hashes, current_hash, window=3) that return is_entropy=true when the same hash appears window times consecutively and false otherwise.
  - Include tests that show normalization makes minor whitespace-only changes produce the same hash while semantically different JSON yields different hashes.

## 2. Task Implementation
- [ ] Implement EntropyDetector with:
  - normalize_output(output: str) -> str: applies trimming, whitespace collapse, and JSON canonicalization when possible.
  - hash_output(output: str) -> str: computes SHA-256 hex of normalized_output.
  - detect_repetition(history_hashes: List[str], current_hash: str, repeat_threshold: int = 3) -> {is_entropy: bool, repeat_count: int, last_hash: str}.
  - Configurable parameters via environment or config file (ENTROPY_REPEAT_COUNT).

## 3. Code Review
- [ ] Verify cryptographic correctness, stable canonicalization, and no accidental data loss during normalization; include benchmarks asserting performance constraints (e.g., 1MB input hashed <200ms in CI environment).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for normalization, hashing, repetition detection, and performance microbenchmarks.

## 5. Update Documentation
- [ ] Add docs/entropy.md describing the algorithm, normalization rules, configuration knobs, and example outputs/hashes for sample traces.

## 6. Automated Verification
- [ ] Add scripts/check_entropy.sh that runs test fixtures through EntropyDetector and asserts expected detection results; exit 0 only on success.
