# Task: Implement Determinism Verification and Monitoring (Sub-Epic: 02_1_PRD)

## Covered Requirements
- [1_PRD-REQ-NEED-AGENT-03]

## 1. Initial Test Written
- [ ] Create tests at tests/determinism/test_detection.py::test_output_hashing_detects_flakiness:
  - Arrange: a small test that non-deterministically prints one of two values (simulate flakiness) and a deterministic seeded run.
  - Act: run the TestRunner N=2 times and collect canonicalized stdout for each run.
  - Assert: when outputs differ, the DeterminismMonitor.compute_hashes(...) returns different SHA-256 hashes and TestRunner reports a non-determinism event.

## 2. Task Implementation
- [ ] Implement DeterminismMonitor at src/monitoring/determinism.py:
  - Expose functions:
    - compute_output_hash(stdout_bytes: bytes, stderr_bytes: bytes) -> str (sha256 hex)
    - compare_runs(run_a: ResultObject, run_b: ResultObject) -> ComparisonReport (fields: stdout_hash_a, stdout_hash_b, equal: bool, diffs[])
  - Integrate with TestRunner to optionally run tests M times (M configurable, default 2) and compare hashes; if hashes differ, emit a non-determinism event that is recorded in `determinism_incidents` table with fields: id, test_suite, stdout_hashes, created_at, sample_artifact_refs.
  - When non-determinism is detected, increment a counter on the Task and (optionally) trigger a hand-off to the user if configured (this linking is an optional integration -- ensure the code checks configuration before invoking HandOffManager).

## 3. Code Review
- [ ] Verify:
  - Hashing uses a stable canonicalization process (strip timestamps, normalize line endings) before hashing.
  - Reports contain enough context to triage flakiness (smallest failing artifact, diffs, environment snapshot).
  - Monitoring avoids false positives by allowing configurable thresholds (e.g., allow one mismatch out of N runs before alerting).

## 4. Run Automated Tests to Verify
- [ ] Run: pytest tests/determinism/test_detection.py -q
  - Expected: monitoring tests detect differences when present and pass when runs are identical.

## 5. Update Documentation
- [ ] Add docs/prd/determinism_monitoring.md with instructions on interpretation of hashes, thresholds, how to triage a determinism incident, and how to link incidents to hand-offs.

## 6. Automated Verification
- [ ] Add CI script scripts/determinism/verify_detection.sh to run a controlled flakiness example and assert the system logs an incident and (optionally) raises a hand-off when configured.
