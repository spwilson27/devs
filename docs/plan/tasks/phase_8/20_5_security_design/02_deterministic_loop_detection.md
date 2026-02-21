# Task: Implement Deterministic Loop Detection (hash-of-last-3) and tests (Sub-Epic: 20_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-081]

## 1. Initial Test Written
- [ ] Create tests at tests/security/test_loop_detection.py and import LoopDetector from src/entropy/loop_detector.py (or reuse src/entropy/detector.py compute_hash helper).
- [ ] Write three unit tests:
  - test_loop_not_triggered_with_less_than_threshold: with fewer than 3 hashes, LoopDetector.is_repeat() returns False.
  - test_loop_triggered_when_three_hashes_equal: feed three identical normalized outputs and assert is_repeat() becomes True.
  - test_loop_not_triggered_for_different_hashes: feed three different outputs and assert is_repeat() remains False.
- [ ] Ensure tests are deterministic, isolated, and fast; avoid I/O and external services.

## 2. Task Implementation
- [ ] Implement src/entropy/loop_detector.py providing:
  - class LoopDetector(window_size: int = 3)
  - add_output(output: str) -> None  # computes normalized sha256 and appends to ring buffer
  - is_repeat() -> bool              # True when last `window_size` hashes are identical
  - last_hashes() -> List[str]       # for debugging and test assertions
- [ ] Reuse the same normalization and compute_hash rules from EntropyDetector to ensure identical hashes when inputs are identical.
- [ ] Keep code small, with clear unit-testable boundaries.

## 3. Code Review
- [ ] Confirm ring buffer implementation is correct (rolling append, not unbounded growth).
- [ ] Verify consistent use of compute_hash normalization rules between EntropyDetector and LoopDetector.
- [ ] Ensure proper typing, docstrings and edge-case handling (e.g., None, empty strings).

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/security/test_loop_detection.py -q` (or repository test runner) and verify tests fail before implementation and pass after implementation.

## 5. Update Documentation
- [ ] Update docs/security/entropy.md with explanation of deterministic loop detection, window size=3 rationale, and how the LoopDetector interacts with the EntropyDetector.

## 6. Automated Verification
- [ ] Add scripts/verify_loop_detection.sh that runs the loop detection tests and exits non-zero on failures; add to CI job definitions or verify scripts list in docs/security/entropy.md.
