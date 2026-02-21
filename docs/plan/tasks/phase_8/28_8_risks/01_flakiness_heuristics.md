# Task: Implement Flakiness Heuristics Detector and Integration (Sub-Epic: 28_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-100]

## 1. Initial Test Written
- [ ] Create unit tests at tests/risks/test_flakiness_detector.py.
  - Write test_detects_flakiness_rate: simulate a deterministic sequence of outcomes for a single test_id (e.g., [pass, fail, pass, pass, fail, pass, pass, pass, fail, pass]) by calling FlakinessDetector.record_outcome(test_id, passed: bool) and assert the computed flake_rate equals the expected value (explicitly compute expected flips vs runs in the test).
  - Write test_no_false_positive_on_stable: all-pass sequence should yield flake_rate == 0.0 and is_flaky(test_id) == False.
  - Write test_threshold_respected: override config threshold (e.g., 0.3) and verify is_flaky respects configured threshold.
  - Use pytest fixtures and deterministic timestamps (monkeypatch time.time) so the tests are repeatable.

## 2. Task Implementation
- [ ] Implement the FlakinessDetector in src/risks/flakiness.py with the following API and behavior:
  - Class FlakinessDetector(window: int = 20, storage_backend: Optional[Storage]=None)
    - record_outcome(test_id: str, passed: bool) -> None
    - flake_rate(test_id: str) -> float
    - is_flaky(test_id: str, threshold: Optional[float] = None) -> bool
  - Maintain a bounded ring buffer of the last `window` outcomes per test_id in-memory; provide a pluggable storage backend interface (in-memory, optional SQLite backend) so the detector can be used across processes.
  - Default config in config/risks.yml: { flakiness: { window: 20, threshold: 0.2 } } and load via existing project config loader.
  - Add a small CLI shim scripts/detect_flakiness.py that accepts --test-id and prints JSON {"test_id": "...", "flake_rate": 0.25, "is_flaky": true}.
  - Add a SQLite table schema (optional) migrations/0001_flakiness.sql describing flakiness_metrics(test_id TEXT PRIMARY KEY, outcomes JSON, last_updated TIMESTAMP) if persistent backend chosen.

## 3. Code Review
- [ ] During review verify:
  - No global mutable state leaks between tests; use dependency injection for storage backend.
  - Metrics computation is deterministic and documented (explicit definition of flake_rate: flips / (runs - 1) or alternate documented formula).
  - Persistence uses atomic writes (SQLite with WAL) and schema is versioned.
  - API is minimal and testable; performance: O(1) per record and memory-bounded by `window`.

## 4. Run Automated Tests to Verify
- [ ] Run the targeted tests:
  - pytest -q tests/risks/test_flakiness_detector.py::test_detects_flakiness_rate tests/risks/test_flakiness_detector.py::test_no_false_positive_on_stable
  - Validate the CLI: python scripts/detect_flakiness.py --test-id test_xyz | jq '.is_flaky == true'

## 5. Update Documentation
- [ ] Add docs/risks/flakiness.md describing:
  - The algorithm and exact mathematical definition of `flake_rate` used.
  - Default config values and how to tune them.
  - Example agent usage: before marking a test as flaky agents MUST call FlakinessDetector and act only if is_flaky returns True.
  - Add a short bullet to docs/dev_agent.md referencing this policy.

## 6. Automated Verification
- [ ] Add tests/scripts/verify_flakiness_detection.py that programmatically exercises the detector with deterministic sequences and exits non-zero on mismatch; ensure CI invokes this script as part of the risks test group.
