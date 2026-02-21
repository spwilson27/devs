# Task: Implement Entropy Detection and Strategy Pivot (Sub-Epic: 28_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-108]

## 1. Initial Test Written
- [ ] Create unit tests at tests/agents/test_strategy_pivot.py.
  - test_pivot_after_three_identical_errors: mock DeveloperAgent to produce three consecutive turn outputs with identical SHA-256 hashes; assert StrategyPivotAgent.pivot_called == True and DeveloperAgent switched to first-principles mode (verify a flag or call recorded).
  - test_entropy_detector_counts_repeated_signatures: feed EntropyDetector.record(output) same output three times and assert detector.detect_loop(signature) returns True when threshold=3.
  - Use pytest with monkeypatching for deterministic timestamps and a fake storage backend (in-memory SQLite or dict).

## 2. Task Implementation
- [ ] Implement the entropy and pivot components in src/agents:
  - src/agents/entropy.py: EntropyDetector class
    - record(output: str, turn_id: str) -> str  # returns signature
    - detect_loop(signature: str, threshold: int = 3) -> bool
    - persist signature counts in SQLite table entropy_signatures(signature TEXT PRIMARY KEY, count INTEGER, last_seen TIMESTAMP)
  - src/agents/strategy_pivot.py: StrategyPivotAgent
    - pivot(developer_agent: DeveloperAgent, reason: str) -> PivotResult
    - produces an RCA draft and forces a strategy reset (clears short-term memory for the current task and switches reasoning mode)
  - Hook into DeveloperAgent turn loop: after each turn compute sha256 of agent output, call EntropyDetector.record and if detect_loop True invoke StrategyPivotAgent.pivot with a structured payload.
  - Add config/agents.yml: { entropy_threshold: 3, pivot_behavior: 'first_principles' }

## 3. Code Review
- [ ] Verify:
  - Database writes are atomic and idempotent; race conditions are guarded (use transactions for incrementing counts).
  - pivot() is idempotent (multiple identical pivot calls do not re-trigger side-effects) and has clear logging and audit trail.
  - The hook into DeveloperAgent is minimal and can be toggled via config; unit tests mock storage and time.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/agents/test_strategy_pivot.py::test_pivot_after_three_identical_errors
- [ ] Confirm EntropyDetector unit tests pass and integration test of DeveloperAgent pivot hook simulates 3 identical failing turns and receives a pivot action.

## 5. Update Documentation
- [ ] Add docs/agents/entropy_and_pivot.md describing:
  - How the SHA-256 signature is computed (normalize whitespace, canonicalize JSON when applicable).
  - Default thresholds and how to tune them.
  - The expected DeveloperAgent behavior after pivot (suspend, RCA generation, strategy change).

## 6. Automated Verification
- [ ] Add tests/scripts/verify_strategy_pivot.py: script that simulates a DeveloperAgent running 5 turns with repeated identical outputs and asserts that StrategyPivotAgent.pivot was invoked exactly once and that an RCA draft file was written to a known temp directory.
