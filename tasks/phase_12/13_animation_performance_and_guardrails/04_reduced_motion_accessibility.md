# Task: Reduced Motion Accessibility Support (Sub-Epic: 13_Animation Performance and Guardrails)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-059], [7_UI_UX_DESIGN-REQ-UI-DES-059-2]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/__tests__/accessibility/`, create `reduced-motion.test.tsx`.
- [ ] Write a unit test that mocks `window.matchMedia` to return `{ matches: true }` for `(prefers-reduced-motion: reduce)` and renders `ReasoningPulse`. Assert that the component renders a static `solid-color` indicator (e.g., `data-testid="pulse-static"`) rather than the animated variant (e.g., absence of `data-testid="pulse-animated"`).
- [ ] Repeat the above test for: `InvocationShimmer`, `DAGCanvas` (critical-path highlight animation), `DistillationSweep`, and `GatedAutonomyPulse` components.
- [ ] Write a test that mocks `window.matchMedia` to return `{ matches: false }` and asserts the animated variants ARE rendered for each component.
- [ ] Write a test verifying the `useReducedMotion` hook (to be created) returns `true` when `prefers-reduced-motion` matches and subscribes to `MediaQueryList.addListener` to react dynamically.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/hooks/useReducedMotion.ts`:
  - Use `window.matchMedia('(prefers-reduced-motion: reduce)')` to read current preference.
  - Use `addEventListener('change', ...)` on the `MediaQueryList` to update React state when the user changes their OS preference mid-session.
  - Return `boolean`.
- [ ] Update every animation-producing component to consume `useReducedMotion()`:
  - `ReasoningPulse`: when `true`, render a solid `opacity: 0.6` circle; skip the `@keyframes` pulse.
  - `InvocationShimmer`: when `true`, skip the shimmer gradient animation; show a static highlighted border.
  - `DAGCanvas` critical-path animation: when `true`, skip the "flowing dash" SVG animation; use a static thick stroke color.
  - `DistillationSweep`: when `true`, skip the sweep animation; show a static checkmark icon.
  - `GatedAutonomyPulse`: when `true`, show a static amber border with no keyframe animation.
- [ ] Create a Storybook story `ReducedMotionShowcase.stories.tsx` demonstrating both motion and reduced-motion states side-by-side for each component (use the `forcedReducedMotion` parameter from `@storybook/addon-a11y`).

## 3. Code Review
- [ ] Verify no component uses `@keyframes` CSS directly inside a JSX `style` attribute when in reduced-motion mode (must branch on `useReducedMotion()` before applying).
- [ ] Confirm the `useReducedMotion` hook correctly cleans up the `MediaQueryList` event listener in its `useEffect` return function to prevent leaks.
- [ ] Ensure all static fallback states communicate the same semantic meaning as their animated counterparts (e.g., a static amber glow still clearly signals a gated state).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test --reporter=verbose packages/webview-ui/src/__tests__/accessibility/reduced-motion.test.tsx` and confirm all assertions pass.
- [ ] Run `pnpm --filter @devs/webview-ui storybook:test` (if configured) to verify Storybook story snapshots pass.

## 5. Update Documentation
- [ ] Add a `## Accessibility` section to `packages/webview-ui/AGENT.md` documenting the `useReducedMotion` hook API and the rule that ALL animation-producing components MUST respect `prefers-reduced-motion`.
- [ ] Update `docs/architecture/animation-system.md` with a table listing each component and its reduced-motion fallback behavior.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test:ci` and verify exit code is `0`.
- [ ] Run the Playwright accessibility test `reduced-motion.spec.ts` (create if absent) that launches the Webview with `--force-prefers-reduced-motion` (Chromium flag) and asserts via `expect(page.locator('[data-testid="pulse-animated"]')).not.toBeVisible()` for each animation component, exiting non-zero on failure.
