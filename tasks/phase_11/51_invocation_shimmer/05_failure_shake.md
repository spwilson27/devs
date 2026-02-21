# Task: Implement Failure Shake animation (horizontal ±4px) (Sub-Epic: 51_Invocation_Shimmer)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-052-4]

## 1. Initial Test Written
- [ ] Create a failing unit test at `src/components/InvocationShimmer/__tests__/failureShake.test.tsx` that:
  - Renders `<InvocationShimmer status="failure" />` (or toggles status to `failure`).
  - Asserts an element with `data-testid="invocation-shimmer"` receives class `invocation--failure` or `invocation-failure-shake` when failure status is set.
  - Asserts the CSS keyframe definition (or the computed animation style string) contains `translateX(-4px)` and `translateX(4px)` (match `/translateX\(-?4px\)/` and `/translateX\(4px\)/`).
  - Confirm the test fails before implementation.

## 2. Task Implementation
- [ ] Implement failure shake animation in `src/styles/_invocation-shimmer.css` and wire it into `InvocationShimmer`:
  - `.invocation--failure { animation: invocation-failure-shake 480ms cubic-bezier(.36,.07,.19,.97) both; }`
  - `@keyframes invocation-failure-shake { 0% { transform: translateX(0); } 10% { transform: translateX(-4px); } 30% { transform: translateX(4px); } 50% { transform: translateX(-4px); } 70% { transform: translateX(4px); } 100% { transform: translateX(0); } }`
  - Ensure `will-change: transform` is used and the animation is GPU-friendly.
  - Respect `prefers-reduced-motion` by providing a non-motion fallback (e.g., brief color flash or border highlight).
- [ ] Add `animationend` cleanup in `InvocationShimmer` to remove `invocation--failure` class after the animation completes (so repeated failures retrigger correctly).

## 3. Code Review
- [ ] Confirm amplitude is exactly ±4px and that keyframes contain both -4px and 4px values.
- [ ] Confirm implementation uses `transform` and `will-change` only (no layout-affecting properties).
- [ ] Confirm accessibility: provide reduced-motion fallback and do not expose the animation to assistive tech (`aria-hidden` remains true).

## 4. Run Automated Tests to Verify
- [ ] Run the project's tests and the new failure shake test: `npx jest src/components/InvocationShimmer --runInBand` (or project equivalent) and ensure it passes.

## 5. Update Documentation
- [ ] Add a short note to `docs/components.md` and the Storybook failure story (task 07) documenting the ±4px shake amplitude and the animation timing function.

## 6. Automated Verification
- [ ] `npx jest --json --outputFile=./tmp/invocation-failure-shake.json` and assert `numFailedTests === 0` and `success === true` in the output. For visual verification, include a Storybook snapshot test for the failure state.
