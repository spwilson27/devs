# Task: Integration tests to validate cost estimation accuracy (Sub-Epic: 07_Cost_Estimation_And_Budgeting)

## Covered Requirements
- [8_RISKS-REQ-057]

## 1. Initial Test Written
- [ ] Create an integration test file `tests/integration/test_cost_estimation_accuracy.py` that performs the following FIRST:
  - Load a fixture dataset `tests/fixtures/benchmark_projects.json` that contains 5 small historical projects. Each project entry must include: project_id, per-task measured_tokens (ground truth), per-task attributes (loc, complexity, model), and actual_cost_usd.
  - For each project in the fixture, call the implemented pre-execution budget estimator and assert that the actual_cost_usd lies within the estimator's reported [lower_bound_usd, upper_bound_usd]. This must be exact for the fixture dataset.
  - test_accuracy_map: compute Mean Absolute Percentage Error (MAPE) across all projects and assert MAPE <= 0.20 (20%).
  - The integration test must be fully deterministic and must not call external pricing APIs; use a mocked/stubbed price catalog stored in the fixture data.

## 2. Task Implementation
- [ ] Implement an integration test harness under `tests/integration/` that:
  - Provides deterministic loader functions for the fixture dataset.
  - Injects a mock price catalog into the estimator to ensure consistent conversion from tokens -> USD.
  - Exposes a small helper `tests/integration/helpers.py` with functions `compute_mape(predictions, actuals)` and `assert_within_tolerance(value, lower, upper)` used by tests.
  - Ensure tests run fast (<30s) by keeping fixtures small and computations simple.

## 3. Code Review
- [ ] During review ensure:
  - The fixture data clearly documents how ground-truth tokens and costs were measured.
  - The integration test proves the +/-20% target is achievable for the sample dataset.
  - Tests are repeatable and not flaky (no random seeds, no network calls).

## 4. Run Automated Tests to Verify
- [ ] Run the integration suite: `pytest -q tests/integration/test_cost_estimation_accuracy.py` and confirm the MAPE assertion and per-project membership of actual costs in predicted bounds.

## 5. Update Documentation
- [ ] Update `docs/estimation.md` with a subsection "Accuracy Benchmarking" that describes the integration test harness, describes the fixture dataset, and explains how to add more ground-truth projects to the fixtures for future validation.

## 6. Automated Verification
- [ ] Add `scripts/verify_estimation_accuracy.sh` that runs the integration test and computes final MAPE; the script should return exit code 0 only if the integration test passes and MAPE <= 0.20.
