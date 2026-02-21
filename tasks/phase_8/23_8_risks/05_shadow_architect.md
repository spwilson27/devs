# Task: Implement Shadow Architect review process (Sub-Epic: 23_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-020]

## 1. Initial Test Written
- [ ] Create unit tests at `tests/unit/test_shadow_architect.py`.
  - Test 1: Given a `plan` object (dictionary) the `ShadowArchitect.analyze_plan(plan)` returns a structured `review` dict containing keys: `approved: bool`, `comments: str`, `suggested_changes: Optional[List[Dict]]`, and `trace_id: str`.
  - Test 2: If the `plan` contains violations of TAS (mocked), `approved` should be False and `suggested_changes` should include explicit TAS violations.
  - Use deterministic mocks for any external model calls; do not call real LLM endpoints in unit tests.

## 2. Task Implementation
- [ ] Implement `devs/agents/shadow_architect.py` with:
  - `class ShadowArchitect:`
    - `def analyze_plan(self, plan: Dict[str,Any]) -> Dict[str,Any]:` implements a structured review using the project's SAOP schema for traceability.
  - The analyze function should produce the fields listed above and include an explicit `score` or confidence metric for automated gating.
  - Ensure the Shadow Architect can be invoked synchronously by PlanNode and returns quickly (mockable local logic for tests; real model calls isolated behind an adapter).
- [ ] Persist the review in PlanNode's metadata store as `plan.reviews.shadow_architect` and include the SAOP trace.

## 3. Code Review
- [ ] Ensure the Shadow Architect produces machine-readable output (not just free text) so downstream gating logic can parse `approved` and `suggested_changes`.
- [ ] Validate the adapter pattern for model calls is used so tests can inject deterministic mock adapters.
- [ ] Confirm that the review includes traceable SAOP IDs and does not leak secrets or raw model responses in logs.

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/unit/test_shadow_architect.py -q` and ensure all tests pass.
- [ ] Add a short integration test where PlanNode calls ShadowArchitect and the review is persisted.

## 5. Update Documentation
- [ ] Document the Shadow Architect contract in `docs/agents/shadow_architect.md` including expected output schema and timeouts.

## 6. Automated Verification
- [ ] Add a CI check that runs Shadow Architect unit tests and fails the build if the adapter is invoked without a mock in tests (i.e., ensure no external model calls in CI unit tests).
