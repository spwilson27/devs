# Task: Implement Phase Stepper Pulse (Amber) (Sub-Epic: 52_Attention_Pulses)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-053-2]

## 1. Initial Test Written
- [ ] Create unit tests at packages/ui/src/components/PhaseStepper/__tests__/PhaseStepperPulse.test.tsx using Jest + React Testing Library.
  - [ ] Test: when PhaseStepper receives `pulseStepId` matching a step, that step has class "phase-stepper__step--pulse-amber" and an accessible label indicating attention.
  - [ ] Test: only the targeted step pulses (other steps do not have the pulse class).
  - [ ] Snapshot test for the step markup while pulsing.
  - [ ] Accessibility test: ensure pulse does not trigger unnecessary aria-live announcements; verify role and aria-attributes are correct.

Tests must be written before implementation so they initially fail.

## 2. Task Implementation
- [ ] Implement visual styles scoped to the PhaseStepper component:
  - Add CSS class .phase-stepper__step--pulse-amber that applies a subtle amber glow (use CSS variable --phase-stepper-pulse-color with fallback to a theme token or rgba(255,183,77,0.95)).
  - Animation should be short and light (suggested: 1200ms ease-in-out, single gentle glow) and avoid layout changes; animate opacity/transform: translateZ(0) + opacity.
  - Example rule: .phase-stepper__step--pulse-amber { box-shadow: 0 0 8px 2px var(--phase-stepper-pulse-color); transform: translateZ(0); }
  - Respect prefers-reduced-motion to disable animation.

- [ ] Code changes:
  - Update PhaseStepper component to accept `pulseStepId?: string` prop (or wire to Zustand state slice) and apply `phase-stepper__step--pulse-amber` to matching step DOM node.
  - Keep changes minimal and isolated to PhaseStepper and its module CSS/Tailwind layer.

- [ ] Tailwind integration (if using Tailwind): add a component layer with the new class and ensure it is tree-shakeable.

## 3. Code Review
- [ ] Verify the amber color is sourced from design tokens (no raw hex literals) and documented as a token in design tokens mapping.
- [ ] Ensure animation doesn’t affect layout and is GPU-friendly (transform/opacity only).
- [ ] Verify that the PhaseStepper API is minimal and that pulseStepId is optional; protect against passing invalid IDs.

## 4. Run Automated Tests to Verify
- [ ] Run the PhaseStepper test suite: `pnpm -w test --filter @devs/ui -- PhaseStepper` (or equivalent).
- [ ] Confirm snapshot and unit tests pass.

## 5. Update Documentation
- [ ] Update docs/ui/components/phase_stepper.md with:
  - API: pulseStepId prop usage and examples
  - Style tokens used: --phase-stepper-pulse-color and suggested fallbacks
  - Accessibility notes and preferred reduced-motion behavior

## 6. Automated Verification
- [ ] Add a Playwright or Storybook visual test that captures a stepper with the pulsing step and validates the amber glow visually against an approved baseline.
- [ ] Optionally add a small integration test that simulates starting the pulse via the UI store and asserts DOM update for the pulsing class then removal after configured duration (see termination task).
