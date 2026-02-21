# Task: Integrate d3-force layout engine and zoom/pan provider (Sub-Epic: 63_DAG_Visualization_Engine)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-021], [9_ROADMAP-TAS-704]

## 1. Initial Test Written
- [ ] Create unit tests for the layout hook at tests/hooks/useForceLayout.test.ts:
  - Mock d3-force's forceSimulation to confirm the hook creates a simulation with provided nodes and links.
  - Simulate a tick event and assert the hook returns updated node positions to the consumer via a stable API (e.g., subscribe or state update).
  - Integration test mounts <DAGCanvas> and asserts that after a simulated tick positions are applied to node elements (data attributes or transformed positions).

## 2. Task Implementation
- [ ] Add a typed layout hook src/components/DAGCanvas/hooks/useForceLayout.ts:
  - API: useForceLayout(nodes, links, options) => { positions, start, stop, setOptions }
  - Use d3-force forceSimulation with sensible defaults (alphaDecay, linkDistance, chargeStrength).
  - Do not mutate original node objects; return new position objects or an index-based positions array.
- [ ] Add a zoom/pan wrapper component src/components/DAGCanvas/ForceEngineProvider.tsx that integrates react-zoom-pan-pinch (or a small internal provider) and exposes a programmatic API for pan/zoom.
- [ ] Update package.json dev/runtime dependencies to include d3-force and react-zoom-pan-pinch (or instruct CI to install them):
  - npm install d3-force react-zoom-pan-pinch --save
  - npm install -D @types/d3-force (if TS), @types/react-zoom-pan-pinch if available

## 3. Code Review
- [ ] Confirm the hook is pure from the perspective of React renders (uses refs and effects correctly).
- [ ] Defaults are configurable and documented.
- [ ] Ensure that the zoom/pan provider does not introduce global event listeners without cleanup.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- tests/hooks/useForceLayout.test.ts and tests/components/DAGCanvas/*integration* to verify layout and pan/zoom integration.

## 5. Update Documentation
- [ ] Document useForceLayout API and ForceEngineProvider usage in docs/components/dagcanvas.md with a small code example and recommended defaults.

## 6. Automated Verification
- [ ] Include a CI check that runs the hook tests and ensures package.json contains d3-force and react-zoom-pan-pinch entries; fail the job if missing.