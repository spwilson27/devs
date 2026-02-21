# Task: Create pre-execution budget estimator with +/-20% bounds (Sub-Epic: 07_Cost_Estimation_And_Budgeting)

## Covered Requirements
- [8_RISKS-REQ-057]

## 1. Initial Test Written
- [ ] Write integration-level unit tests in `tests/test_budget_estimator.py` that assert end-to-end estimation behavior for a small synthetic roadmap. Tests to write FIRST:
  - test_budget_estimate_synthetic_roadmap: construct a synthetic roadmap with 3 tasks (each with loc, complexity, model) and assert the estimator returns a dictionary with {"total_tokens": int, "estimated_cost_usd": float, "lower_bound_usd": float, "upper_bound_usd": float}
  - test_bounds_within_tolerance: for the estimator that uses default confidence propagation, assert that upper_bound/estimated_cost_usd - 1.0 <= 0.20 and 1.0 - lower_bound/estimated_cost_usd <= 0.20 (i.e., +/-20% envelope contains the estimate). Use deterministic inputs so the numeric assertions are exact.
  - test_handles_empty_roadmap: empty roadmap returns zeros and does not crash.
  - Tests must mock price-per-token values (e.g., set price_per_token=0.0000012) and not rely on real external pricing APIs.

## 2. Task Implementation
- [ ] Implement `src/estimator/budget_estimator.py` that exposes `estimate_project_budget(roadmap: list, price_catalog: dict, confidence_pct: float = 80.0) -> dict` with the following behavior:
  - roadmap: list of tasks where each task is {"task_id", "loc", "complexity", "model", "extra_prompt_tokens"}
  - price_catalog: mapping from model->price_per_token_usd
  - For each task, call the token heuristic `estimate_tokens_for_task` to get tokens; aggregate tokens across roadmap.
  - estimated_cost_usd = total_tokens * price_per_token (use model-specific price when tasks use mixed models: sum per-task cost)
  - Compute a conservative uncertainty envelope: default +/-20% for pre-execution by using simple proportional bounds: lower = estimated_cost_usd * (1 - 0.20), upper = estimated_cost_usd * (1 + 0.20). Implement hooks so the +/- percentage can be tuned per-project or computed from sample variance when historical data exists.
  - Return structure: {"total_tokens": int, "estimated_cost_usd": float, "lower_bound_usd": float, "upper_bound_usd": float, "per_task_breakdown": list}
  - The implementation must be pure (no network calls) and accept injected price_catalog for testability.

## 3. Code Review
- [ ] Verify:
  - Correct per-task pricing when mixed models are present (sum task_cost = tokens_for_task * price_catalog[model]).
  - The +/-20% default is configurable via function parameter or configuration file `config/costs.yaml`.
  - Unit tests and integration tests cover empty and multi-model roadmaps.
  - Numeric stability (use Decimal or careful float handling for USD calculations to avoid surprising rounding errors) if project uses Python; if using JS/TS, ensure to use integer token arithmetic and round currency to cents where appropriate.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/test_budget_estimator.py` (or equivalent). Confirm that the estimator returns expected structure and numeric values for the synthetic roadmap.

## 5. Update Documentation
- [ ] Update `docs/estimation.md` with a subsection "Pre-Execution Budget Estimator" that documents:
  - Function signature and usage examples.
  - Default +/-20% behavior and where to configure it.
  - Example input synthetic roadmap and the expected output JSON.

## 6. Automated Verification
- [ ] Add `scripts/verify_budget_estimator.sh` that:
  - Runs the specific test file and exits non-zero on failure.
  - Runs a small sanity check script that calls `estimate_project_budget` with the synthetic roadmap and asserts the output JSON keys and numeric tolerance checks (upper/lower bounds within +/-20%).
