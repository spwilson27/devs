# Task: Implement Epic partitioning algorithm with 8-16 epic constraint (Sub-Epic: 05_Task_Constraints_And_Planning)

## Covered Requirements
- [1_PRD-REQ-PLAN-006], [9_ROADMAP-TAS-014], [9_ROADMAP-DOD-P5]

## 1. Initial Test Written
- [ ] Create tests at `tests/unit/test_epic_partitioning.py` using `pytest` that:
  - Provide a realistic sample input: `list[dict]` requirements with `id`, `title`, `tags`, `estimated_complexity`.
  - Assert `partition_requirements_to_epics(requirements, min_epics=8, max_epics=16)` returns between 8 and 16 Epics for normal-sized inputs (e.g., 100+ requirements).
  - Assert every input requirement id appears exactly once in the union of `assigned_req_ids`.
  - Assert deterministic output for identical inputs (call twice, compare).
  - Assert edge cases: when requirements count < `min_epics`, algorithm returns `N` epics where `N = max(1, min(len(requirements), max_epics))` and documents behavior.

## 2. Task Implementation
- [ ] Implement `src/planner/partitioner.py`:
  1. Implement function `partition_requirements_to_epics(requirements, min_epics=8, max_epics=16, seed=None)`.
  2. Algorithm steps:
     - Normalize requirements: extract tags/milestone if present.
     - Group by primary tag/milestone; form initial buckets.
     - If bucket count < `min_epics`, split largest buckets by requirement count (deterministic sort) until reaching `min_epics`.
     - If bucket count > `max_epics`, merge smallest buckets until within limits.
     - If neither, balance by round-robin assignment across target epic count to produce deterministic distribution.
  3. Return list of `EpicSummary` objects with fields: `title` (derived), `assigned_req_ids` (list[str]), `rationale` (string), `estimated_task_count` (int placeholder).
  4. Add unit-level logging for decision points; avoid non-determinism (no `random.shuffle`).
  5. Add configuration hooks for future ML clustering.
  6. Keep complexity O(n log n).

## 3. Code Review
- [ ] Verify:
  - Deterministic behavior and clear rationale strings.
  - No use of external clustering libs.
  - Edge case handling is explicit and tested.
  - Function signatures are documented and exported in package `planner` API.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/unit/test_epic_partitioning.py -q` and ensure pass.

## 5. Update Documentation
- [ ] Add design doc section `docs/roadmap_partitioning.md` describing algorithm with pseudocode and examples; include a mermaid flow diagram of partitioning decisions.

## 6. Automated Verification
- [ ] Add `scripts/verify_partitioning.py` that loads `tests/fixtures/requirements_sample.json`, runs partitioning, asserts `8<=len(epics)<=16` and writes results to `artifacts/partitioning_result.json` for CI inspection.
