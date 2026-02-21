# Task: Node rendering: render ports using centered positions (Sub-Epic: 69_DAG_Edge_Metrics)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-046-4]

## 1. Initial Test Written
- [ ] Write integration tests for the Node component (src/components/dag/Node.tsx) that mount a Node with a given width and portCount and assert rendered port DOM elements (data-testid="node-port-<index>") have X positions matching computePortPositions results. Place tests in src/components/dag/__tests__/Node.ports.test.tsx.

## 2. Task Implementation
- [ ] Update Node.tsx to import computePortPositions and, during render, compute positions and map them to port elements (<div className="port" style={{ left: `${x}px` }} data-testid={`node-port-${i}`} />). Ensure ports are centered vertically (top: 50% with transform translateY(-50%)) and implement accessible labels. For SVG-based node renderers, render circle elements at computed positions on the appropriate edge.

## 3. Code Review
- [ ] Verify Node uses the pure computePortPositions function (no duplicated math), that port elements use data-testid attributes for tests, that layout is responsive if node width changes, and that styling uses CSS classes and CSS variables rather than inline hardcoded colors/metrics except for left positional style which is numeric.

## 4. Run Automated Tests to Verify
- [ ] Run npx jest src/components/dag/__tests__/Node.ports.test.tsx and the DAG integration tests to ensure DOM positions match the pure function outputs within the configured tolerance.

## 5. Update Documentation
- [ ] Update docs/ui/dag.md with an example showing Node props that affect port layout (width, portSize, sidePadding) and a small code snippet demonstrating how ports are rendered and styled.

## 6. Automated Verification
- [ ] Add a CI step that mounts Node in a headless DOM and runs the Node.ports.test to assert port positions across multiple widths and port counts; fail on deviation > 0.5px.
