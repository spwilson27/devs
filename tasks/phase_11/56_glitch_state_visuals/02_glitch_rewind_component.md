# Task: Implement Rewind Glitch Animation Component (Sub-Epic: 56_Glitch_State_Visuals)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-058-1], [7_UI_UX_DESIGN-REQ-UI-DES-120]

## 1. Initial Test Written
- [ ] Create unit tests (Jest + React Testing Library) at tests/components/GlitchRewind.test.tsx that assert:
  - The component renders without throwing.
  - When the prop `active={true}` is passed the component adds the `glitch--active` class.
  - When the system preference `prefers-reduced-motion: reduce` is simulated, the component renders an accessible static fallback and no animation classes are applied.
  - Snapshot test of the static DOM structure (not animated pixels).

## 2. Task Implementation
- [ ] Implement a React component at src/components/GlitchRewind.tsx with signature: React.FC<{active:boolean; onAnimationEnd?:()=>void}>.
  - Use purely CSS-based animations where possible: define keyframes for RGB split, horizontal jitter, and scanline sweep using tokens from src/ui/glitchTokens.css.
  - Avoid layout-affecting properties; use transform and opacity only. Add `will-change: transform, opacity` and prefer `translate3d` for GPU acceleration.
  - Respect prefers-reduced-motion by conditionally applying animation classes or setting animation-duration: 0ms.
  - Expose an `aria-hidden` attribute when decorative; when `active` is true include `role="status"` and `aria-live="polite"` so assistive tech receives a short announcement like "State rewind in progress".
  - Export small utility for JS-driven keyframe toggling if necessary, but prefer CSS toggles to keep the component lightweight.

## 3. Code Review
- [ ] Ensure the implementation: uses tokens (no hardcoded colors/durations), is theme-aware (no forced light/dark values), avoids expensive CSS properties, and does not trigger layout reflows.
- [ ] Confirm accessibility attributes are present and announcements are succinct; ensure reduced-motion is honored.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- tests/components/GlitchRewind.test.tsx` and update snapshots if expected. Run the test in CI or locally.

## 5. Update Documentation
- [ ] Update docs/ui/glitch-visuals.md with example usage snippet for <GlitchRewind active={true} /> and a short note on recommended places to trigger the rewind visual (e.g., timeline rewind, undo stack restore).

## 6. Automated Verification
- [ ] Add a Playwright or Puppeteer visual regression script `tests/e2e/glitch-rewind.spec.ts` that loads the component in a minimal web page, triggers `active`, captures a 1s animated GIF or three-frame PNG sequence, and compares against a baseline image. The CI should fail if pixel diff > 2%.
