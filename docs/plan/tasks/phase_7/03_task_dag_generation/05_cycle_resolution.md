# Task: Implement CycleResolution Utility (Sub-Epic: 03_Task_DAG_Generation)

## Covered Requirements
- [4_USER_FEATURES-REQ-035]

## 1. Initial Test Written
- [ ] Create unit tests at tests/unit/test_cycle_resolution.py validating the resolution strategies and that applying a suggested resolution yields an acyclic graph.
  - Test: test_edge_removal_strategy
    - Input: small cycle A->B->C->A with weights/priorities; call suggest_resolutions(cycle) and assert suggestions contain candidate edge removals ranked by minimal cost.
  - Test: test_split_task_strategy
    - Input: a cycle where one task can be decomposed into two tasks splitting responsibilities; assert that applying split produces no cycles and preserves requirement traceability.
  - Test: test_apply_resolution_is_idempotent
    - Applying the recommended minimal resolution to the graph yields an acyclic graph and the resolution record can be applied/replayed safely.

## 2. Task Implementation
- [ ] Implement src/roadmap/cycle_resolution.py with API functions:
  - suggest_resolutions(cycle: Cycle, graph: Graph) -> List[ResolutionProposal]
    - Strategies to implement (in priority order):
      1. Edge removal heuristic (remove least-impactful dependency edge based on weight/priority/estimate).
      2. Task split (propose splitting a task into two with adjusted dependencies) when applicable, preserving requirement mapping.
      3. Manual gating (introduce explicit gate task to break cycle) with clear instructions.
  - apply_resolution(graph, proposal) -> new_graph
    - Apply a chosen proposal and return modified graph; ensure all IDs remain stable or documented.
  - validate_post_resolution(graph) -> bool
    - Run cycle detection to confirm acyclic and produce verification artifact.

## 3. Code Review
- [ ] Verify proposals contain actionable steps (edge id, reason, estimated impact), all proposals are reversible (record undo info), and resolution preserves requirement traceability (task.requirement_ids unchanged or explicitly documented change).

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/unit/test_cycle_resolution.py -q

## 5. Update Documentation
- [ ] Add docs/operations/cycle_resolution.md describing heuristics, how to present proposals to a human or agent reviewer, and mermaid examples of before/after.

## 6. Automated Verification
- [ ] scripts/verify_cycle_resolution.sh that loads a cycle fixture, runs suggest_resolutions, applies the top proposal, and asserts detect_cycles(new_graph) returns empty.