# Task: Implement Roadmap Mapping & RTI Calculation (Sub-Epic: 11_Technical_Requirements_and_Feedback)

## Covered Requirements
- [9_ROADMAP-TAS-013]

## 1. Initial Test Written
- [ ] Write integration/unit tests in `tests/roadmap/test_rti_and_mapping.py` BEFORE implementation. Tests to write first:
  - test_requirements_to_epics_mapping(): provide a set of 8-10 synthetic `TechRequirement` dicts and assert the mapping function returns 8-16 epics and that each requirement is assigned to exactly one epic (or explicit "unassigned" bucket).
  - test_rti_full_coverage(): given a set of requirements and generated tasks (simulate or stub tasks), assert `compute_rti(requirements, tasks) == 1.0` when every requirement has at least one mapped task that cites the req_id.
  - test_zero_cycle_enforcement(): ensure DAG generator rejects cycles (supply a synthetic cycle) and raises `CycleDetectedError`.

## 2. Task Implementation
- [ ] Implement `src/roadmap/mapping.py` with functions:
  - `map_requirements_to_epics(requirements: List[Dict]) -> Dict[epic_id, List[req_ids]]` using logical clustering heuristics (topic keywords, shared tags, or source file grouping).
  - `generate_tasks_from_requirements(requirements: List[Dict]) -> List[TaskDict]` minimal task skeletons referencing req_id in each task's `source_requirements` field.
  - `compute_rti(requirements, tasks) -> float` which computes traceability coverage (num_requirements_with_task / total_requirements) as a float between 0.0 and 1.0.
  - `generate_dag(tasks) -> DAG` enforcing zero cycles (raise clear exception when cycle detected) and produce adjacency list for downstream consumers.
- [ ] Keep the implementation deterministic and add small, explainable heuristics (document comments inline) so automated reviewers understand clustering rules.

## 3. Code Review
- [ ] Verify algorithmic complexity is documented and that `compute_rti` is numerically stable. Confirm `generate_dag` uses explicit cycle detection (e.g., Kahn's algorithm) and has unit tests for edge cases.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/roadmap/test_rti_and_mapping.py` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add `docs/phase_7/11_technical_requirements_and_feedback/roadmap_mapping.md` describing the mapping heuristics, RTI calculation, and sample outputs (epic assignments and sample DAG JSON).

## 6. Automated Verification
- [ ] Provide `scripts/verify_rti_mapping.sh` that runs the roadmap tests and prints the RTI for included sample inputs; CI must fail if RTI < 1.0 for the provided canonical sample.
