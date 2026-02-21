# Task: Ensure accessibility (aria-live, keyboard nav) for ThoughtStreamer (Sub-Epic: 57_ThoughtStreamer_Component)

## Covered Requirements
- [1_PRD-REQ-INT-009], [6_UI_UX_ARCH-REQ-017]

## 1. Initial Test Written
- [ ] Create an accessibility test at src/ui/components/__tests__/ThoughtStreamer.a11y.spec.tsx using jest-axe that renders the component with new messages and asserts there are no accessibility violations; also assert presence of role="log" and aria-live="polite" on the container.

## 2. Task Implementation
- [ ] Implement accessibility features:
  - Container: role="log" aria-live="polite" aria-atomic="false" data-testid="thought-streamer".
  - Each message: aria-label="<TYPE> at <ISO timestamp>: <short text>" and data-type attribute.
  - Keyboard navigation: implement keyboard handlers (ArrowUp/ArrowDown) to move focus between message nodes; provide skip-to-bottom keyboard shortcut (e.g., End key) and focus styles.
  - Respect prefers-reduced-motion and disable visual motion (pulses/transitions) when set.

## 3. Code Review
- [ ] Verify aria attributes are correct and stable, keyboard interactions are documented and test-covered, ensure that aria-live announcements are not noisy on rapid updates (debounce announcement behavior if necessary).

## 4. Run Automated Tests to Verify
- [ ] Run jest-axe tests (npm run test:a11y or jest --runTestsByPath src/ui/components/__tests__/ThoughtStreamer.a11y.spec.tsx) and perform a short manual screen reader walk-through (VoiceOver/NVDA) describing steps.

## 5. Update Documentation
- [ ] Document accessibility behaviors and test steps in docs/ui/thoughtstreamer.md and add guidance for manual verification.

## 6. Automated Verification
- [ ] Add an axe-core run in CI that executes the a11y test and fails on any violations introduced by changes to ThoughtStreamer.
