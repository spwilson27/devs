# Task: Implement Active Progress Sweep (2px scan) (Sub-Epic: 51_Invocation_Shimmer)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-052-2]

## 1. Initial Test Written
- [ ] Create a failing unit test at `src/components/InvocationShimmer/__tests__/progressSweep.test.tsx` that:
  - Renders `<InvocationShimmer active={true} />` (or a dedicated `<InvocationProgressSweep active/>` test component).
  - Asserts an element with `data-testid="invocation-progress-sweep"` exists while `active` is true.
  - Asserts the element has `style.height === '2px'` (or class `.invocation-progress-sweep` which sets `height: 2px`).
  - Asserts the element has an animation class or inline style referencing `invocation-progress-scan` keyframes (match `/invocation-progress-scan/` in class or style string).
  - Run the test and confirm it fails before implementation.

## 2. Task Implementation
- [ ] Implement the progress sweep markup and styling inside `src/components/InvocationShimmer/InvocationShimmer.tsx` or as a tiny child component `src/components/InvocationShimmer/InvocationProgressSweep.tsx`:
  - Markup: `<div data-testid="invocation-progress-sweep" className="invocation-progress-sweep" aria-hidden="true" />` absolutely positioned to sweep across the top (or configured location) of the shimmer container.
  - CSS (in `src/styles/_invocation-shimmer.css`):
    - `.invocation-progress-sweep { position: absolute; left: 0; top: 0; height: 2px; width: 100%; pointer-events: none; overflow: hidden; }`
    - Inner moving element `.invocation-progress-sweep__bar { height: 100%; width: 25%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); transform: translateX(-120%); animation: invocation-progress-scan 1200ms linear infinite; will-change: transform; }`
    - `@keyframes invocation-progress-scan { to { transform: translateX(120%); } }` — use transform to ensure GPU compositing.
  - Ensure `prefers-reduced-motion: reduce` disables the animation and instead shows a static indicator.
- [ ] Use hardware-friendly styles (transform) and `will-change: transform` for smoothness.

## 3. Code Review
- [ ] Confirm height is exactly 2px and defined in CSS (not via layout offsets).
- [ ] Confirm movement uses `transform` (translateX) not `left`/`margin` to avoid layout thrashing.
- [ ] Confirm the animation can be toggled off with `prefers-reduced-motion`.

## 4. Run Automated Tests to Verify
- [ ] Run test suite and the new progress sweep test: `npx jest src/components/InvocationShimmer --runInBand` (or project equivalent). Ensure the test passes after implementation.

## 5. Update Documentation
- [ ] Add a small Storybook story or README example showing the active progress sweep state and note the 2px height requirement.

## 6. Automated Verification
- [ ] Run `npx jest --json --outputFile=./tmp/invocation-progress-sweep.json` and assert `numFailedTests === 0` and `success === true`. Also run a brief Lighthouse/DevTools performance smoke if available to ensure the animation is using GPU compositing.
