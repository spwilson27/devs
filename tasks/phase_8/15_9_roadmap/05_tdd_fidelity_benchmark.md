# Task: Implement TDD Fidelity Benchmark (Sub-Epic: 15_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-REQ-033]

## 1. Initial Test Written
- [ ] Create tests at tests/test_tdd_fidelity.py that verify fidelity calculation and boundary conditions.
  - test_fidelity_basic: given a sequence of run records where 8/10 runs produced valid failing tests and 7/10 completed Red->Green successfully, assert compute_fidelity returns the expected composite score (define scoring formula in test comments).
  - test_fidelity_edge_cases: zero runs, all failures, all successes; ensure function handles division by zero and returns 0 or 100 appropriately.
  - test_metrics_persistence: ensure metric rows are persisted in `metrics` table and not duplicated on repeated runs.

## 2. Task Implementation
- [ ] Implement FidelityBench in src/agents/fidelity.py and a CLI helper to compute reports.
  - Persistence: table `tdd_metrics(task_id TEXT, run_id TEXT, produced_failing_test BOOLEAN, red_to_green BOOLEAN, created_at TIMESTAMP)`.
  - Function compute_fidelity(task_id: str) -> dict with keys {fidelity_score: float, details: {failing_test_rate, red_to_green_rate}}.
  - CLI: bin/compute_fidelity.py --task-id <id> --format json|csv
  - Add a small example dataset under tests/fixtures to exercise compute_fidelity in tests.

## 3. Code Review
- [ ] Validate scoring formula is clearly documented and defensible; ensure time windows and run deduplication logic are correct.

## 4. Run Automated Tests to Verify
- [ ] pytest -q tests/test_tdd_fidelity.py and run the CLI against the fixture DB to verify JSON and CSV outputs.

## 5. Update Documentation
- [ ] docs/metrics/tdd_fidelity.md with formula, example output, and recommended alert thresholds (e.g., fidelity < 75% triggers human review).

## 6. Automated Verification
- [ ] Provide tests/support/verify_fidelity_report.py that seeds the DB with fixture runs and asserts that compute_fidelity produces the documented output values.
