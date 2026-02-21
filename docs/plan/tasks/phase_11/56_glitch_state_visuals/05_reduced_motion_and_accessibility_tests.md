# Task: Add Reduced Motion and Accessibility Tests for Glitch UI (Sub-Epic: 56_Glitch_State_Visuals)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-058-1], [7_UI_UX_DESIGN-REQ-UI-DES-120]

## 1. Initial Test Written
- [ ] Add unit tests and accessibility tests at tests/accessibility/glitch.accessibility.test.ts that assert:
  - When `prefers-reduced-motion: reduce` is simulated, the GlitchRewind and other glitch visuals do not apply animations and render static fallback.
  - Color usage in glitch visuals meets WCAG 2.1 AA contrast when rendered against common VSCode themes (light/dark). Use jest-axe or axe-playwright for automated checks.

## 2. Task Implementation
- [ ] Implement the reduced-motion behavior using CSS `@media (prefers-reduced-motion: reduce)` and JS fallbacks where necessary. Reference tokens for reduced-motion durations set to 0ms.
- [ ] Add an accessibility test harness (tests/accessibility/harness.ts) that can render components under simulated system preferences and run axe queries.

## 3. Code Review
- [ ] Ensure reduced-motion code paths are explicit and tested; ensure visual fallbacks are meaningful (e.g., show a static icon + text) and do not remove essential information. Confirm contrast checks pass for the chosen token values.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests and axe checks: `npm test -- tests/accessibility/glitch.accessibility.test.ts` and confirm no axe violations at level WCAG 2.1 AA for the tested fragments.

## 5. Update Documentation
- [ ] Update docs/ui/glitch-visuals.md with a dedicated section describing reduced-motion behavior, testing strategy, and how to simulate preferences in dev/test environments.

## 6. Automated Verification
- [ ] Add a CI job or local script `scripts/check-accessibility.sh` that runs the accessibility test suite headlessly and fails on any new violations; ensure the job is fast (cached downloads) and provides actionable reports (JSON) for failures.
