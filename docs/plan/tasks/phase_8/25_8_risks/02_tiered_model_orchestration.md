# Task: Implement Tiered Model Orchestration (Sub-Epic: 25_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-056]

## 1. Initial Test Written
- [ ] Add unit tests at tests/test_tiered_model_orchestrator.py using pytest describing exact behavior:
  - test_route_to_flash_for_low_latency_tasks: create three model clients representing tiers (flash, standard, high-accuracy). The orchestrator should route tasks marked as `task_type='lint'` or `priority='low-latency'` to the flash tier; assert the selected client is the flash client.
  - test_fallback_between_tiers: simulate flash tier failing and assert the orchestrator selects the next tier in order.
  - test_budget_and_resource_aware_selection: mock available_budget and assert that when budget is below threshold, orchestrator routes to lower-cost tiers.

Include concrete filenames and imports so tests import devs.risks.tiered_model_orchestrator.TieredModelOrchestrator.

## 2. Task Implementation
- [ ] Implement src/devs/risks/tiered_model_orchestrator.py with the following:
  - Class TieredModelOrchestrator(tiers: List[TierConfig], policy: dict = None)
  - TierConfig: {name: str, clients: List[ModelClient], capacity: int, cost_per_call: float}
  - Public method: async def select_client(self, task_metadata: dict, budget: Optional[float]) -> ModelClient that deterministically selects a client based on task metadata, tier priority, and budget.
  - Implement routing rules for explicit mappings (e.g., `task_type -> tier`) and fallback semantics.
  - Provide a pluggable selector strategy so policies can be swapped for A/B experiments.
  - Add configuration via config/risks_tiers.yaml and feature flags for toggling Flash usage.

## 3. Code Review
- [ ] Verify policy-driven routing, small functions, deterministic selection, clear policy schema, tests for edge cases (empty tier, equal-cost tie-break), and ensure orchestration decisions are logged for observability.

## 4. Run Automated Tests to Verify
- [ ] Run pytest -q tests/test_tiered_model_orchestrator.py and additionally run an integration simulation script (scripts/simulate_orchestration.py) that simulates 1000 mixed-task requests and asserts no exceptions and expected routing distribution.

## 5. Update Documentation
- [ ] Add docs/risks/tiered_model_orchestration.md describing tier definitions, policy schema, how to tune costs/capacity, and the default mappings for common task types (lint, compile, unit-test-run).

## 6. Automated Verification
- [ ] Add a CI target scripts/verify_tiered_orchestration.sh that runs unit tests and the simulate_orchestration.py script with deterministic randomness (seeded RNG) and fails CI if routing deviates from expected distributions beyond a small epsilon.
