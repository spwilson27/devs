# Task: Implement Dependency Deadlock Detection (Sub-Epic: 03_Task_DAG_Generation)

## Covered Requirements
- [9_ROADMAP-REQ-PLAN-003]

## 1. Initial Test Written
- [ ] Create unit tests at tests/unit/test_deadlock_detection.py that validate detection of deadlocks (cycles) and provide precise cycle reports.
  - Test: test_detect_simple_cycle
    - Input: tasks A->B, B->A. Call detect_deadlocks(tasks) and assert it returns one cycle [[A,B]] with entries matching expected ids and the smallest cycle decomposition.
  - Test: test_detect_complex_scc
    - Input: tasks containing an SCC of size 3 and other acyclic parts. Assert the returned cycles include the SCC and include metadata: cycle_nodes, cycle_edges.
  - Test: test_no_deadlock_returns_empty
    - Input: acyclic graph returns empty list.

## 2. Task Implementation
- [ ] Implement detect_deadlocks at src/roadmap/deadlock.py
  - Use Tarjan's strongly connected components algorithm to find SCCs; any SCC with size > 1 or a self-loop indicates a deadlock.
  - Return a list of cycle objects: {"cycle_nodes":[ids], "cycle_edges":[[from,to],...], "suggested_resolutions": [ {"type":"edge_removal","candidates":[...]} ] }
  - Ensure the function is pure and accepts either a Graph object or list of task dicts and produces stable, testable outputs.

## 3. Code Review
- [ ] Confirm correctness of SCC detection, clear API for returned cycle data structure, and inclusion of requirement_ids for each task in the cycle to help operator decisions.
- [ ] Validate performance characteristics on fixtures of up to several thousand nodes (document complexity O(N+E)).

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/unit/test_deadlock_detection.py -q

## 5. Update Documentation
- [ ] Add docs/operations/deadlock_detection.md describing the returned cycle schema, example CLI usage to print cycles, and recommended human actions.

## 6. Automated Verification
- [ ] scripts/verify_deadlock.sh that loads fixtures/cycle_fixture.json, runs detect_deadlocks, and asserts exactly the expected cycles are reported.