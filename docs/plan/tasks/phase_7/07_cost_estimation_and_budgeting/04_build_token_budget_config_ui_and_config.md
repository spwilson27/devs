# Task: Build token budget configuration and enforcement hooks (Sub-Epic: 07_Cost_Estimation_And_Budgeting)

## Covered Requirements
- [4_USER_FEATURES-REQ-084]

## 1. Initial Test Written
- [ ] Write unit tests in `tests/test_token_budget_config.py` and an integration test that verifies configuration-driven enforcement. Tests to include:
  - test_config_schema_loads: ensure the configuration loader reads `config/costs.yaml` and validates `token_budget` and `per_epic_budget` fields using JSON schema or a typed config loader.
  - test_budget_enforcement_cli_flag: simulate running the budget enforcement check with `--token-budget=100000` and a small roadmap; assert that when total estimated tokens exceed the budget, the enforcement function returns a structured rejection `{"allowed": False, "reason": "budget_exceeded", "excess_tokens": N}`.
  - test_per_epic_limit_enforced: create two epics where one exceeds its per-epic budget and assert enforcement returns per-epic violation information.

## 2. Task Implementation
- [ ] Implement configuration and enforcement hooks:
  - Add configuration schema and default file `config/costs.yaml` containing keys:
    - default_token_budget: int (global cap)
    - per_epic_budget: mapping epic_id -> int
    - enforce_on_run: boolean
  - Implement a config loader `src/estimator/config.py` that validates and exposes config values application-wide.
  - Implement `src/estimator/budget_enforcer.py` with function `enforce_token_budget(roadmap: list, config: dict) -> dict` that returns `{allowed: bool, violations: list}`. This function must be fully unit-testable (pure, no I/O).
  - Wire an enforcement check into the CLI or the roadmap gate: add a CLI flag `--token-budget` and a pre-execution hook that calls `enforce_token_budget` and aborts the run when enforcement returns false.
  - If project has a web UI: add a small webview component `ui/tokenBudgetPanel` that displays current budget, per-epic budgets, and a list of violating tasks (UI changes should be minimal and behind a feature flag `feature.token_budgeting`). If no UI exists, ensure CLI-only behavior is implemented.

## 3. Code Review
- [ ] Verify:
  - The config loader refuses malformed budgets and provides clear error messages.
  - Enforcement is deterministic and returns machine-readable structured violations suitable for UI consumption.
  - CLI integration correctly returns non-zero exit code when enforcement fails.
  - Unit tests cover per-epic and global budget use-cases.

## 4. Run Automated Tests to Verify
- [ ] Execute `pytest -q tests/test_token_budget_config.py` to validate config loading and enforcement behavior.

## 5. Update Documentation
- [ ] Update `docs/estimation.md` with a subsection "Token Budgeting and Enforcement" describing config keys, CLI flags, sample `config/costs.yaml`, and the expected JSON shape of enforcement results for the UI.

## 6. Automated Verification
- [ ] Add `scripts/verify_token_budget.sh` that:
  - Loads `config/costs.yaml` and runs `enforce_token_budget` against two synthetic roadmaps (one under budget, one over budget) and asserts expected boolean outcomes.
  - Exits non-zero if any assertion fails. This script will be used by automated checks to ensure enforcement behavior is real and reproducible.
