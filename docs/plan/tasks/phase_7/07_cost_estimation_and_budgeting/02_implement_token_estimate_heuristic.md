# Task: Implement token estimation heuristic and tunable multipliers (Sub-Epic: 07_Cost_Estimation_And_Budgeting)

## Covered Requirements
- [9_ROADMAP-TAS-504], [9_ROADMAP-REQ-032]

## 1. Initial Test Written
- [ ] Write unit tests first in `tests/test_token_heuristic.py` that assert deterministic outputs for a defined formula. The tests must include:
  - test_basic_formula: given the canonical inputs below, assert the heuristic returns the exact expected token count.
    - Inputs: loc=50, complexity=0.4, model="gpt-3.5"
    - Constants (use these exact constants in the test to drive implementation): base_tokens_per_loc=20, prompt_overhead=300, complexity_multiplier = 1.0 + (complexity * 1.5), model_multiplier={'gpt-3.5':1.0,'gpt-4':1.2}
    - Expected calculation (explicit): expected = int((base_tokens_per_loc * loc) * complexity_multiplier * model_multiplier[model] + prompt_overhead)
    - For the sample input above the test should compute expected using the formula and assert equality against the function under test.
  - test_model_multipliers: assert that switching the model to "gpt-4" increases the token estimate by the exact multiplier.
  - test_edge_cases: loc=0 returns at least prompt_overhead; complexity=0 and complexity=1 yield distinct, correct multipliers.
  - All tests must be deterministic and not depend on external resources.

## 2. Task Implementation
- [ ] Implement a new module `src/estimator/token_heuristic.py` (or `src/estimator/tokenHeuristic.ts`) with a single exported function `estimate_tokens_for_task(attrs: dict) -> int` with the following contract:
  - Inputs (attrs): {"loc": int, "complexity": float (0.0-1.0), "model": str, "extra_prompt_tokens": int (optional)}
  - Use the canonical constants from the tests (base_tokens_per_loc, prompt_overhead, complexity_multiplier, model_multiplier) but read them from a configuration file `config/costs.yaml` so they are tunable.
  - Implementation details:
    1. Validate inputs (loc >= 0, complexity in [0,1]).
    2. Compute complexity_factor = 1.0 + (complexity * 1.5).
    3. model_factor = model_multiplier.get(model, 1.0)
    4. raw_tokens = base_tokens_per_loc * loc
    5. estimated = int(raw_tokens * complexity_factor * model_factor + prompt_overhead + attrs.get('extra_prompt_tokens', 0))
    6. Return max(estimated, prompt_overhead) to ensure minimum token floor.
  - Export accompanying helper `estimate_cost_from_tokens(tokens:int, price_per_token:float)->float`.
  - Add type hints, docstrings, and unit-level function comments describing formula and units.

## 3. Code Review
- [ ] Confirm:
  - The function is pure and deterministic with no side effects.
  - All constants are loaded from configuration `config/costs.yaml` with sane defaults in code.
  - Edge cases (0 LOC, missing model) are handled deterministically.
  - Tests cover sample inputs and edge cases; numeric assertions use exact equality per TDD requirements.

## 4. Run Automated Tests to Verify
- [ ] Run the tests added in step 1: `pytest -q tests/test_token_heuristic.py` (or equivalent). Ensure tests pass locally.

## 5. Update Documentation
- [ ] Update `docs/estimation.md` with a subsection "Token Estimation Heuristic" that explains the formula, the meaning of constants, and where to tune them (path `config/costs.yaml`). Include the canonical example calculation used in tests so reviewers can quickly validate correctness.

## 6. Automated Verification
- [ ] Add `scripts/verify_token_heuristic.sh` that:
  - Runs the single test file and exits non-zero on failure.
  - Loads `config/costs.yaml` and asserts that base_tokens_per_loc and prompt_overhead exist and are numeric.
  - Runs a small assertion that `estimate_tokens_for_task({'loc':50,'complexity':0.4,'model':'gpt-3.5'})` equals the expected integer computed using the constants file (this ensures the code reads config correctly).
