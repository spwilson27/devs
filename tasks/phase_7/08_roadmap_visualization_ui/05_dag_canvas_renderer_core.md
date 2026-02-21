# Task: Implement DAG Canvas Core Renderer (Sub-Epic: 08_Roadmap_Visualization_UI)

## Covered Requirements
- [1_PRD-REQ-UI-006], [4_USER_FEATURES-REQ-033]

## 1. Initial Test Written
- [ ] Create unit tests for renderer logic at tests/ui/roadmap/renderer.test.(ts|js):
  - Given a deterministic DAG JSON (nodes with ids, sizes, and edges), assert that layout functions produce stable x/y coordinates for nodes, correct bezier or polyline paths for edges, and consistent z-ordering of nodes vs labels.
  - Test connector routing for simple and forked edges to ensure no overlapping nodes in small test graphs.

## 2. Task Implementation
- [ ] Implement core rendering utilities at src/ui/roadmap/renderer.ts and a presentational component src/ui/roadmap/DagCanvas.(tsx|jsx):
  - Use SVG for deterministic rendering and export pure layout functions (computeNodePositions(dag, options)).
  - Ensure the canvas renders incrementally and supports virtualization if node count > 500 (lazy rendering placeholder).
  - Provide public APIs for programmatic pan/zoom and hit-testing (node under point).

## 3. Code Review
- [ ] Verify layout algorithm is O(n log n) where feasible for large DAGs, verify memoization and pure function usage, and confirm that rendering logic is framework-agnostic (pure utilities separated from UI bindings).

## 4. Run Automated Tests to Verify
- [ ] Run the renderer unit tests: `npm test -- tests/ui/roadmap/renderer.test` and ensure layout outputs match recorded snapshots (stored in tests/fixtures/layout_snapshot.json).

## 5. Update Documentation
- [ ] Add docs/ui_renderer.md describing the layout algorithm, public compute APIs, and guidance for tuning layout parameters (node spacing, edge routing preferences).

## 6. Automated Verification
- [ ] Add a headless verification harness `scripts/verify_renderer.js` that imports computeNodePositions, runs it against the canonical fixture DAG for `4_USER_FEATURES-REQ-033`, and diffs the output against the committed snapshot using a stable serializer.