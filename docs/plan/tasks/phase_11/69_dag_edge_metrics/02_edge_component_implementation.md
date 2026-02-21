# Task: Edge component implementation: enforce canonical stroke weights (Sub-Epic: 69_DAG_Edge_Metrics)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-046-3]

## 1. Initial Test Written
- [ ] Before implementing, ensure the unit tests created in 01_edge_stroke_unit_tests.md fail (red). If those tests do not exist, write minimal failing tests that expect strokeWidth=1 for thin and 2.5 for thick.

## 2. Task Implementation
- [ ] Implement src/components/dag/Edge.tsx (or Edge.jsx/Edge.tsx depending on codebase) that: (a) exports a typed prop interface { thickness?: 'thin'|'thick'|number; strokeWidth?: number; } where explicit number prop overrides named thickness; (b) maps 'thin' -> 1 and 'thick' -> 2.5 and uses CSS custom properties as fallbacks: const thin = getComputedStyle(el).getPropertyValue('--edge-stroke-thin') || '1px'; const thick = getComputedStyle(el).getPropertyValue('--edge-stroke-thick') || '2.5px'; (c) renders an SVG <line> or <path> with strokeWidth set to the numeric value (no unit in the prop, pass number to React); (d) add data-testid="dag-edge" for tests and export a small pure helper mapThicknessToPx(thickness) function in the same module and unit-test it.

## 3. Code Review
- [ ] Verify implementation uses a single source of truth for stroke constants (exported constants EDGE_STROKE_THIN = 1, EDGE_STROKE_THICK = 2.5), has TypeScript typings, avoids inline magic numbers, includes the mapping helper with its own unit tests, and keeps SVG rendering accessible (aria-hidden or title as appropriate).

## 4. Run Automated Tests to Verify
- [ ] Run npx jest src/components/dag/Edge.test.tsx && npx jest src/components/dag/__tests__/Edge.strokes.test.tsx and ensure mapping helper tests and rendering tests pass.

## 5. Update Documentation
- [ ] Update docs/ui/components.md or docs/ui/dag.md describing the Edge component API (props: thickness|strokeWidth), default values, and the CSS variables used for overrides. Document how to set CSS variables in the Webview host.

## 6. Automated Verification
- [ ] Add a CI unit-test step that runs the helper unit tests and verifies EDGE_STROKE_* constants have expected numeric values; fail CI if constants change without explicit review.
