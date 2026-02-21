# Task: Implement Thought Pulse Timing (2000ms) (Sub-Epic: 50_Thought_Pulse_Logic)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-051-2]

## 1. Initial Test Written
- [ ] Add a unit test at `src/ui/components/__tests__/ThoughtPulse.timing.test.tsx` using Jest + React Testing Library + @testing-library/jest-dom.
  - Render `<ThoughtPulse durationMs={2000} data-testid="thought-pulse" />` and assert the wrapper element contains the inline style `--thought-pulse-duration: 2000ms` or a class that maps to 2000ms.
  - Use `expect(getByTestId('thought-pulse')).toHaveStyle('--thought-pulse-duration: 2000ms')` to make the assertion.
  - Add a test that changing the `durationMs` prop updates the inline variable and that the animation CSS property reflects the updated duration (inspect `element.style.animationDuration` or the inline CSS variable).

## 2. Task Implementation
- [ ] Implement duration behavior in `src/ui/components/ThoughtPulse.tsx`:
  - Ensure the component sets `style={{ ['--thought-pulse-duration']: `${durationMs}ms` }}` and the CSS uses `animation-duration: var(--thought-pulse-duration)`.
  - Use a defensive clamp for `durationMs` (e.g., min 100ms, max 10000ms) and document the clamp in comments.
  - Provide a default prop of `2000` to satisfy the requirement by default.
  - Ensure the CSS keyframes and animation timing function are consistent across browsers (use `animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1)` unless overridden by project standards).

## 3. Code Review
- [ ] Verify:
  - The duration is set via CSS variable not via JS-driven interval loops.
  - Type definitions enforce `durationMs?: number` and the clamp behavior.
  - Tests cover both default behavior and an overridden duration.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test -- --testPathPattern=ThoughtPulse.timing.test.tsx` and confirm tests pass.

## 5. Update Documentation
- [ ] Update `docs/ui/thought_pulse.md` (or create it if missing) to include the `durationMs` prop, default value (2000ms), and permitted range.

## 6. Automated Verification
- [ ] CI verification: `pnpm test -- --testPathPattern=ThoughtPulse` must pass. Additionally run `node -e "console.log(require('./dist/ThoughtPulse') ? 'ok' : 'fail')"` only if build artifacts are available; primary verification is the unit tests passing in CI.
