# Task: Implement Motion Primitives (AnimatedTransform & Pulse) (Sub-Epic: 48_Motion_Philosophy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-006-1], [7_UI_UX_DESIGN-REQ-UI-DES-006]

## 1. Initial Test Written
- [ ] Add unit tests under packages/ui-components/src/motion/__tests__/ that assert the following behavior for each primitive:
  - AnimatedTransform applies only CSS `transform` and `opacity` changes (the test should render the component and inspect the DOM node's style/transition properties).
  - AnimatedTransform uses translate3d(...) for positional changes to force GPU layer creation.
  - AnimatedTransform uses the standard easing and duration from ANIMATION_POLICY.
  - Pulse component toggles opacity (not layout) and respects prefers-reduced-motion by disabling animation when reduced-motion is active.

Test implementation details:
1. Use React Testing Library + JSDOM to render components.
2. For transform verification, assert computed style contains 'transform' and that transition-property equals 'transform, opacity' or similar.
3. Add tests that mock matchMedia for reduced-motion and assert no CSS transitions are applied.

## 2. Task Implementation
- [ ] Implement two components in packages/ui-components/src/motion:
  - AnimatedTransform.tsx: React component that animates between transform states using CSS classes and inline styles. It must only use `transform` and `opacity` for animation and call getAnimationPolicy() to read duration/easing.
  - Pulse.tsx: lightweight component that toggles opacity to indicate "system pulsing". It must honor reduced-motion and expose aria-hidden or role when used for decorative pulses (but pulses used for 'attention' should be aria-announced where appropriate).
- [ ] Ensure components accept props: durationMs?: number (clamped to policy.maxDurationMs), easing?: string (defaults to policy.easing), reducedMotion?: boolean (overrides matchMedia), and children/render prop.
- [ ] Prefer CSS class-based transitions to avoid layout thrashing. Use will-change: transform, opacity only when active.

Implementation steps:
1. Create files AnimatedTransform.tsx and Pulse.tsx, add types and tests.
2. Use getAnimationPolicy() from @devs/ui-motion for runtime values.
3. Export components from packages/ui-components/src/index.ts.

## 3. Code Review
- [ ] Verify components never animate non-allowed properties (top/left/width/height), ensure accessibility (reduced motion, ARIA), ensure types and default props documented.
- [ ] Ensure components are pure and side-effect free (no global style injection beyond classnames and will-change usage).

## 4. Run Automated Tests to Verify
- [ ] Run: pnpm --filter @devs/ui-components test and confirm motion primitive tests pass.

## 5. Update Documentation
- [ ] Add API docs for both components in packages/ui-components/README.md and add small usage examples showing data-distillation and system-pulse usage.

## 6. Automated Verification
- [ ] Add a CI check that mounts the component in a headless browser and inspects computed styles to ensure only transform/opacity are used for transitions (puppeteer script).