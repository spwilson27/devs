# Task: Implement Static SVG Snapshot Handler for Complex Traces (Sub-Epic: 100_Shared_Logic_SVG_Hooks)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-039]

## 1. Initial Test Written
- [ ] Create a test file `packages/ui-components/src/Snapshot/StaticSVGSnapshot.test.tsx`.
- [ ] Define a sample "complex profiler trace" JSON object.
- [ ] Write a test to verify that the `StaticSVGSnapshot` component renders a non-interactive `<svg>` element.
- [ ] Assert that the output does not contain any 3D-related primitives or WebGL contexts.
- [ ] Verify that the SVG contains paths or shapes representing the trace data provided.

## 2. Task Implementation
- [ ] Create a component `StaticSVGSnapshot` in `packages/ui-components/src/Snapshot/StaticSVGSnapshot.tsx`.
- [ ] Implement logic to convert profiler trace data (flamegraph or tree) into a static set of SVG `<rect>` and `<text>` elements.
- [ ] Use a lightweight layout algorithm to position trace nodes without relying on heavy external D3 libraries if possible, or use D3 only for calculation and render static SVG nodes in React.
- [ ] Ensure the component is optimized for "snapshot" mode, meaning no event listeners for hover/click are attached to individual trace nodes to keep the DOM light.

## 3. Code Review
- [ ] Ensure the component adheres to `6_UI_UX_ARCH-REQ-039` by explicitly avoiding 3D or high-overhead interactive visualizations.
- [ ] Verify that the SVG is responsive to its container width using `viewBox`.
- [ ] Check for proper accessibility labels (`aria-label`) on the SVG to describe the trace content.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` in the `packages/ui-components` directory.
- [ ] Ensure the `StaticSVGSnapshot` tests pass with various trace complexities.

## 5. Update Documentation
- [ ] Document the usage of `StaticSVGSnapshot` in the project's Component Library documentation.
- [ ] Note that this component is the preferred way to display historical or complex traces that would otherwise degrade performance.

## 6. Automated Verification
- [ ] Verify that the bundle size of the component is within the limits set in `6_UI_UX_ARCH-REQ-007`.
- [ ] Run a lint check to ensure no prohibited 3D libraries (like Three.js) are imported in this component.
