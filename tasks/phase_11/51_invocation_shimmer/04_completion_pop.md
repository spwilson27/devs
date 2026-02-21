# Task: Implement Completion Pop animation (scale 1.02) (Sub-Epic: 51_Invocation_Shimmer)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-052-3]

## 1. Initial Test Written
- [ ] Create a failing unit test at `src/components/InvocationShimmer/__tests__/completionPop.test.tsx` that:
  - Renders `<InvocationShimmer status="success" />` (or toggles status to `success`).
  - Asserts that after the `status` becomes `success` an element with `data-testid="invocation-shimmer"` receives a class `invocation--success` or `invocation-completion-pop`.
  - Asserts the computed style (or class) indicates a transform scale of `1.02` (match `/scale\(1\.02\)/` in style or animation keyframe text returned by a CSS parser used by the test environment).
  - Confirm the test fails before implementation.

## 2. Task Implementation
- [ ] Implement the success pop animation as follows:
  - CSS (in `src/styles/_invocation-shimmer.css`):
    - `.invocation--success { animation: invocation-completion-pop 220ms ease-out both; }`
    - `@keyframes invocation-completion-pop { 0% { transform: scale(1); } 60% { transform: scale(1.02); } 100% { transform: scale(1); } }`
  - Behavior: On status transition to `success`, add the `invocation--success` class to the presentational root for one animation cycle; remove it on `animationend` to keep class usage idempotent.
  - Ensure the animation uses `transform` only and is disabled for `prefers-reduced-motion` (fallback to a quick opacity flash instead).
- [ ] Update `src/components/InvocationShimmer/InvocationShimmer.tsx` to toggle the class on status change and to emit `animationend` cleanup.

## 3. Code Review
- [ ] Confirm the pop amplitude is exactly `1.02` (no more, no less) and documented in a comment.
- [ ] Confirm the animation uses `transform` and does not trigger layout or reflow.
- [ ] Confirm reduced-motion behavior: if user prefers reduced motion, do not scale; optionally use a brief opacity change.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` and run the new completion pop test directly: `npx jest src/components/InvocationShimmer --runInBand` (or project equivalent). Ensure tests pass.

## 5. Update Documentation
- [ ] Add a short note to `docs/components.md` and Storybook (task 07) describing the completion pop behavior and duration (220ms) and the precise scale (1.02).

## 6. Automated Verification
- [ ] `npx jest --json --outputFile=./tmp/invocation-completion-pop.json` and assert `numFailedTests === 0` and `success === true` in the JSON output. Also run a headless rendering check (Storybook snapshot) to ensure the component scales as expected in the success story.
