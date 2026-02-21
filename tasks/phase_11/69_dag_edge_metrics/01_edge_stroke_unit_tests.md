# Task: Edge rendering: Unit tests for edge stroke weight (Sub-Epic: 69_DAG_Edge_Metrics)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-046-3]

## 1. Initial Test Written
- [ ] Write unit tests using Jest + React Testing Library for the Edge component located at src/components/dag/Edge.tsx (or src/ui/dag/Edge.tsx). Create tests that: (a) render the Edge with prop thickness="thin" and assert that the rendered SVG element (<line> or <path>) has stroke-width equal to 1 (or computed style 1px); (b) render the Edge with prop thickness="thick" (or highlight=true) and assert stroke-width equals 2.5 (or computed style 2.5px); (c) verify that when CSS custom properties --edge-stroke-thin / --edge-stroke-thick are set on a wrapper element the component uses those values; (d) include a snapshot of the rendered SVG for regression.

## 2. Task Implementation
- [ ] Implement tests in a new file src/components/dag/__tests__/Edge.strokes.test.tsx. Use data-testid="dag-edge" on the rendered SVG element to select it. Use container.querySelector('line, path') and expect(getComputedStyle(node).strokeWidth || node.getAttribute('stroke-width')) to match the numeric values. Mock any required props (source/target coordinates) so the Edge renders deterministically.

## 3. Code Review
- [ ] Confirm tests exercise both code paths (thin vs thick), do not depend on global CSS, assert numeric values within a 0.1 tolerance for floating comparisons, and include meaningful test names. Ensure test file and helper mocks follow the codebase test conventions (Jest + RTL) and no snapshot contains environment-specific values.

## 4. Run Automated Tests to Verify
- [ ] Run the project's test runner for the new file: e.g., npm test -- src/components/dag/__tests__/Edge.strokes.test.tsx or npx jest src/components/dag/__tests__/Edge.strokes.test.tsx --coverage and confirm the new tests pass.

## 5. Update Documentation
- [ ] Add an entry to docs/ui/dag.md describing the stroke weight options (thin=1px, thick=2.5px) and the CSS custom properties used (--edge-stroke-thin, --edge-stroke-thick). Commit the test file and doc update in the same PR with a clear commit message linking the requirement ID.

## 6. Automated Verification
- [ ] As part of CI verify: run npx jest --coverage and assert the new test file passes; assert there are no snapshot diffs (npx jest -u only when intentionally updating snapshots). Include a CI check that fails if the Edge stroke assertions regress.
