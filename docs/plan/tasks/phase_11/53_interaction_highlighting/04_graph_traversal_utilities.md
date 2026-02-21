# Task: Implement Graph Traversal Utilities (Sub-Epic: 53_Interaction_Highlighting)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-055-3]

## 1. Initial Test Written
- [ ] Create unit tests at src/lib/__tests__/graphUtils.test.ts:
  - Test getUpstream(nodeId, edges) with edges [{source:'A',target:'B'},{source:'B',target:'C'}]; expect getUpstream('C') to return ['B','A'] (or a documented ordering).
  - Test getDownstream('A') returns ['B','C'].
  - Test behavior on cycles: when edges form a cycle ensure functions do not loop infinitely and return unique node ids.
  - Test with disconnected graph segments.

## 2. Task Implementation
- [ ] Implement src/lib/graphUtils.ts (or .js/.ts) exporting:
  - getUpstream(nodeId: string, edges: Array<{source:string,target:string}>): string[]
  - getDownstream(nodeId: string, edges: Array<{source:string,target:string}>): string[]
  - getConnectedEdges(nodeId, edges)
- [ ] Use iterative BFS/DFS with a Set visited to prevent cycles and ensure O(N + E) complexity.
- [ ] Add clear JSDoc/type signatures and defensive input validation (empty arrays, missing fields).

## 3. Code Review
- [ ] Confirm functions are pure, deterministic, and cycle-safe.
- [ ] Verify performance characteristics (linear in nodes+edges) and that tests cover edge cases.
- [ ] Ensure exported API is minimal and documented for other modules (DAGCanvas) to consume.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- --testPathPattern=graphUtils.test.ts and ensure all tests pass.

## 5. Update Documentation
- [ ] Add API documentation in docs/lib/graphUtils.md with examples and complexity notes.

## 6. Automated Verification
- [ ] Run jest and assert all tests for graphUtils pass; include coverage check for the module.

Commit notes: open PR implementing graph traversal utilities, tests, and docs; include Co-authored-by trailer.
