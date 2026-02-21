# Task: Task Dependency DAG Generator (Sub-Epic: 02_Decomposition_And_Orchestration)

## Covered Requirements
- [1_PRD-REQ-PLAN-003], [2_TAS-REQ-003]

## 1. Initial Test Written
- [ ] Create tests at `tests/unit/test_dag_generator.py` that MUST be written first:
  - [ ] `test_builds_dag_from_tasks_without_cycles()` supplies tasks with explicit `dependencies` and asserts `build_dag(tasks)` returns a DAG with correct edges and a valid topological ordering.
  - [ ] `test_detects_cycles_and_raises()` constructs a cyclic dependency set and asserts `CycleDetectedError` is raised and the cycle nodes are returned in the error payload.
  - [ ] `test_parallel_execution_levels()` asserts that `dag.parallel_levels()` calculates execution groups where tasks in the same level have no inter-dependencies.

## 2. Task Implementation
- [ ] Implement `src/planner/dag.py`:
  - [ ] `build_dag(tasks: List[TaskDict]) -> DAG` builds adjacency lists, validates referenced task IDs exist, and raises clear errors for missing refs.
  - [ ] Implement cycle detection using Kahn's algorithm (preferred) or Tarjan strongly connected components; raise `CycleDetectedError(cycle_nodes)`.
  - [ ] Implement `parallel_levels(dag)` that returns list of lists representing layers executable in parallel.
  - [ ] Add `scripts/generate_task_dag.py --tasks tasks.json --out dag.json` to export DAG (nodes, edges, levels).
  - [ ] Implement a simple `cycle_resolution` utility that (in automatic mode) breaks the weakest dependency (lowest confidence) or (in interactive mode) prompts for manual remapping; for this task implement automatic mode with a conservative policy and emit a `resolution_report.json` of changes made.

## 3. Code Review
- [ ] Verify correctness of cycle detection and that the DAG builder validates inputs strictly.
- [ ] Ensure performance is acceptable for 200+ tasks and that the logic is covered by unit and integration tests.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/unit/test_dag_generator.py` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add `docs/dag_generator.md` documenting the DAG JSON schema, cycle resolution policy, and CLI usage.

## 6. Automated Verification
- [ ] Add `tests/scripts/verify_dag.sh` that generates a DAG from `tests/fixtures/tasks_sample.json`, asserts acyclicity, validates level grouping, and writes `verification/dag_report.json` with node/edge counts and execution levels.
