# Task: Implement DAG Generation Engine (Sub-Epic: 03_Task_DAG_Generation)

## Covered Requirements
- [9_ROADMAP-TAS-503]

## 1. Initial Test Written
- [ ] Create unit tests at tests/unit/test_dag_generator.py covering core DAG behaviour.
  - Test: test_build_dag_and_toposort
    - Given a list of tasks with explicit dependencies (task ids), call build_dag(tasks) and topological_sort(graph).
    - Assert topological_sort returns an ordering where for every edge u->v, u appears before v.
  - Test: test_detect_cycle_raises
    - Provide a small cyclic input (A depends on B, B depends on A) and assert build_dag or detect_cycles raises or returns a cycle structure.
  - Test: test_dag_adjacency_and_indegree
    - Validate adjacency list and indegree counts for a small DAG fixture.

## 2. Task Implementation
- [ ] Implement DAG building and utilities at src/roadmap/dag.py
  - Functions: build_dag(tasks: List[dict]) -> Graph (adjacency map), detect_cycles(graph) -> List[List[node_ids]], topological_sort(graph) -> List[node_ids].
  - Algorithms: Use Kahn's algorithm for topological_sort (O(N+E)) and DFS-based or Tarjan's algorithm for cycle detection/SCCs.
  - Determinism: When multiple nodes have indegree 0, order deterministically (e.g., sort by stable task id) so tests remain stable.

## 3. Code Review
- [ ] Ensure time complexity is O(N+E), algorithms are well-documented, and functions return serializable structures (lists, dicts) not custom generators.
- [ ] Confirm robust handling of malformed inputs (unknown dependency ids -> raise a clear ValidationError).

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/unit/test_dag_generator.py -q

## 5. Update Documentation
- [ ] Add docs/architecture/dag.md with mermaid diagrams for a sample DAG and descriptions of algorithms (Kahn and Tarjan).

## 6. Automated Verification
- [ ] Add scripts/ci_check_dag.sh that loads a test fixture tasks.json, runs build_dag and topological_sort, and asserts ordering validity programmatically; return non-zero on failure.