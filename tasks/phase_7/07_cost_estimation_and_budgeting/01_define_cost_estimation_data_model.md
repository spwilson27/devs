# Task: Define cost estimation data model and validation (Sub-Epic: 07_Cost_Estimation_And_Budgeting)

## Covered Requirements
- [1_PRD-REQ-NEED-MAKER-03], [9_ROADMAP-TAS-504]

## 1. Initial Test Written
- [ ] Create unit tests in tests/test_cost_model.py using the project's test runner (prefer pytest for Python). The tests must include the following independent assertions (write the tests FIRST):
  - test_fields_and_types: instantiate a CostEstimate with the following sample data and assert types and exact attribute names:
    - project_phase_id: "phase-1"
    - epic_id: "epic-1"
    - task_id: "task-1"
    - estimated_tokens: 1000
    - estimated_cost_usd: 0.12
    - confidence_pct: 95.0
    - complexity_score: 0.40
  - test_serialization_roundtrip: call to_dict()/to_json() then from_dict()/from_json() and assert deep equality between original and deserialized object.
  - test_validation_rejects_negative_tokens: attempt to construct with estimated_tokens=-1 and assert that the constructor or validate() raises a validation exception (ValueError/TypeError depending on language conventions).
  - Use deterministic fixture file tests/fixtures/cost_estimate_sample.json for serialization tests; tests must not call any external service.
  - Run a single test to drive TDD initially: `pytest -q tests/test_cost_model.py::test_fields_and_types` (or use the project's equivalent single-test invocation).

## 2. Task Implementation
- [ ] Implement a small, pure data model for cost estimates under the project's source tree.
  - Preferred Python implementation (mirror in TS/JS if project uses that stack): create `src/estimator/models.py` with:
    - class CostEstimate:
      - __init__(self, project_phase_id: str, epic_id: str, task_id: str, estimated_tokens: int, estimated_cost_usd: float, confidence_pct: float, complexity_score: float, notes: Optional[str]=None)
      - def validate(self): raise ValueError for invalid fields: estimated_tokens < 0, estimated_cost_usd < 0.0, confidence_pct not in [0.0,100.0], complexity_score not in [0.0,1.0]
      - def to_dict(self) -> dict and @staticmethod def from_dict(d: dict) -> 'CostEstimate'
      - Add utility static method estimate_cost_from_tokens(tokens:int, price_per_token:float)->float
    - If TypeScript: create `src/estimator/costModel.ts` with equivalent interface and class and named exports.
  - Add a JSON Schema at `docs/schemas/cost_estimate.json` that defines required fields, types, and ranges (used by automated validation and UI schema).
  - Ensure the module is importable from the package root (update package exports / __init__.py / index.ts if necessary).
  - Add docstrings/comments enumerating units (tokens, USD) and intended usages (per-task, per-epic, per-phase aggregation).

## 3. Code Review
- [ ] Verify the following during self-review or PR review:
  - The data model is isolated (no I/O, no network calls) and is pure data + validation.
  - All public methods include type annotations/docstrings and the fields are documented in the JSON schema.
  - Validation errors are explicit and consistent (same exception types and messages across inputs).
  - Unit tests cover normal, boundary and invalid inputs and fail prior to implementation (TDD cycle correctness).
  - Module LoC is small (prefer <200 LoC for this task).

## 4. Run Automated Tests to Verify
- [ ] Execute the project's test runner for the new test file and confirm green:
  - If Python: `pytest -q tests/test_cost_model.py`
  - If Node: `npm test -- tests/test_cost_model.js` or `yarn test tests/test_cost_model.js`
  - Confirm the new tests pass and that running them before implementation produced failures (TDD verified).

## 5. Update Documentation
- [ ] Add `docs/estimation.md` describing:
  - CostEstimate schema field-by-field, allowed ranges, and example JSON.
  - How confidence_pct and complexity_score should be interpreted by downstream heuristics.
  - How to run the unit tests for this model.
  - Add an agent memory entry or metadata file at `.agent_memory/cost_estimation_model.json` with a short summary (field names and units).

## 6. Automated Verification
- [ ] Add `scripts/verify_cost_model.sh` that performs the following checks (used by CI):
  - Runs the single test file and fails if exit code != 0: `pytest -q tests/test_cost_model.py`.
  - Verifies that the implementation file contains the class name (e.g., `grep -E "class CostEstimate|export class CostEstimate" src/estimator || exit 2`).
  - Exits 0 only when both tests and grep pass. This script is used by the final automated verification step to ensure the agent didn't claim tests passed incorrectly.
