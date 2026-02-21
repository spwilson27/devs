# Task: Implement Roadmap Planner Core Algorithm (Sub-Epic: 06_Roadmap_Planner_And_Gates)

## Covered Requirements
- [9_ROADMAP-REQ-PLAN-002]

## 1. Initial Test Written
- [ ] Create unit tests at tests/phase_7/test_roadmap_planner.py using pytest.
  - test_partition_into_8_to_16_epics: Generate a synthetic set of 200 mapped requirement objects (each must include an "estimate_tokens" integer) and call RoadmapPlanner.plan(mapped_requirements). Assert that 8 <= len(result['epics']) <= 16.
  - test_balance_epics_by_estimate: Construct mapped requirements with skewed token estimates and assert that the planner balances total token_estimate across epics within 20% variance.
  - test_deterministic_with_seed: Call planner with a fixed seed twice and assert identical outputs (JSON-stable comparison).
  - test_invalid_input_raises: Passing an empty list or malformed items should raise a clear ValueError or return an empty roadmap per agreed behavior (choose one and document it in tests).
- [ ] Use fixtures to create deterministic sample inputs and avoid external randomness.

## 2. Task Implementation
- [ ] Implement src/roadmap/planner.py with class RoadmapPlanner implementing:
  - def plan(self, mapped_requirements: List[Dict], target_epic_count: Optional[int]=None, seed: int=0) -> Dict:
    - Validate inputs and compute total token_estimate.
    - If target_epic_count is None, compute a heuristic within [8,16] (e.g., clamp(ceil(total_tokens/1200), 8, 16)).
    - Use a deterministic balanced bin-packing algorithm (greedy by token_estimate with seed-stable tie-breaking) to partition requirements across target_epic_count epics.
    - Group requirements by semantic tags as a secondary pass to keep related requirements together.
    - Return roadmap dict: {'epics':[{'id':'epic-1','title':'Epic 1','requirements':[req_ids], 'token_estimate':int}, ...], 'meta':{'seed':seed, 'algorithm':'balanced-binpack'}}.
  - Add helper functions for serialization to stable JSON and to compute per-epic token_estimate.
  - Keep algorithm deterministic and provide configuration knobs for future replacement by ML-based grouping.

## 3. Code Review
- [ ] Ensure the algorithm is deterministic with explicit seeding and documented complexity.
- [ ] Verify modularity: core partitioning algorithm separate from IO and serialization.
- [ ] Confirm adequate test coverage for edge cases and performance considerations on 200+ items.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/phase_7/test_roadmap_planner.py
- [ ] Perform quick integration bench: python -m src.roadmap.planner --sample > /tmp/roadmap.json and verify JSON schema and that 8-16 epics produced.

## 5. Update Documentation
- [ ] Add docs/roadmap/planner.md describing the algorithm, heuristics for choosing epic count, configuration flags, and example CLI usage.
- [ ] Update architecture docs to include RoadmapPlanner's public API and expected inputs/outputs.

## 6. Automated Verification
- [ ] Provide scripts/verify_roadmap_planner.sh which runs the tests, produces a sample roadmap with fixed seed, and diffs the output against a committed sample to ensure deterministic behavior in CI.
