# Task: Implement node & edge state rendering and node interactions (Sub-Epic: 63_DAG_Visualization_Engine)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-020], [6_UI_UX_ARCH-REQ-075]

## 1. Initial Test Written
- [ ] Add unit tests at tests/components/NodeCard.test.tsx and tests/components/EdgeHighlight.test.tsx:
  - NodeCard renders different visual states (PENDING, RUNNING, SUCCESS, FAILED) and exposes data-state attributes.
  - Hovering a node causes an edge highlight for connected edges; assert class/data attribute changes.
  - Selection toggles node selected state and emits an onSelect callback with the node id.

## 2. Task Implementation
- [ ] Implement src/components/DAGCanvas/NodeCard.tsx and src/components/DAGCanvas/Edge.tsx:
  - NodeCard must accept state prop (enum) and render accessible markup (role="button" or similar) with aria-pressed for selection.
  - Edge component must be lightweight and accept highlight boolean; optimized for SVG path rendering.
  - Ensure styling uses CSS variables / theme tokens to avoid hardcoded colors.
  - Provide APIs for hover/select events: onHover(nodeId), onSelect(nodeId).

## 3. Code Review
- [ ] Confirm accessible semantics for nodes (keyboard operable, focusable, aria-labels).
- [ ] Ensure styling uses theme variables and that NodeCard dimensions match design guidelines.
- [ ] Verify that edge highlighting is efficient (class toggle rather than re-rendering entire graph when possible).

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- tests/components/NodeCard.test.tsx tests/components/EdgeHighlight.test.tsx and ensure all behavior assertions pass.

## 5. Update Documentation
- [ ] Document node and edge APIs in docs/components/dagcanvas.md including examples for subscribing to hover/select events.

## 6. Automated Verification
- [ ] Provide a small script scripts/verify-node-edge.sh that mounts a small graph, simulates hover/select, and prints JSON with emitted events; CI must run it to ensure behavior is intact.