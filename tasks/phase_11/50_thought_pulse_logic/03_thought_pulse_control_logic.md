# Task: Implement Thought Pulse Control Logic (start/stop, neutral marker) (Sub-Epic: 50_Thought_Pulse_Logic)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-051-3], [7_UI_UX_DESIGN-REQ-UI-UNK-002]

## 1. Initial Test Written
- [ ] Create `src/ui/components/__tests__/ThoughtPulse.control.test.tsx` with Jest + React Testing Library.
  - Test controlled mode: render `<ThoughtPulse active={false} data-testid="thought-pulse" />`, verify no `thought-pulse--active` class or active animation style is present.
  - Test toggling prop: re-render with `active={true}` and assert the active class/style appears.
  - Test imperative control: if using `forwardRef`, obtain ref and call `ref.current.start()` and `ref.current.stop()` and assert animation class toggled accordingly using `toHaveClass` / `not.toHaveClass` or `toHaveStyle` for the animation variable.
  - Test neutral marker: render `<ThoughtPulse neutral data-testid="thought-pulse" />` and assert an attribute or class `data-neutral="true"` or `thought-pulse--neutral` exists and has the expected non-active visual semantics (no color override; a neutral CSS variable `--thought-pulse-neutral-marker` should be set).

## 2. Task Implementation
- [ ] Implement control API in `src/ui/components/ThoughtPulse.tsx`:
  - Support both controlled (`active` prop) and uncontrolled (internal `isActive` state) modes. If `active` prop is provided, it should be the source of truth; otherwise expose `start()`/`stop()` via `useImperativeHandle` + `forwardRef`.
  - When `start()` is called or `active` becomes true, set an internal flag to add the CSS class `thought-pulse--active` to trigger the animation (CSS still driven by variables defined in Task 01 and Task 02).
  - When `stop()` is called or `active` becomes false, remove the class and ensure animation resets cleanly (use `animation-play-state: paused` or remove animation class and trigger a reflow if necessary).
  - For the neutral marker requirement (7_UI_UX_DESIGN-REQ-UI-UNK-002), add support for a `neutral` prop that sets `data-neutral="true"` and uses a CSS variable `--thought-pulse-neutral-marker` to control neutral visuals; neutral state must not use the active color and must not animate unless explicitly activated.
  - Ensure proper cleanup of timers/event listeners (no lingering intervals or RAFs) to avoid memory leaks.

## 3. Code Review
- [ ] Verify:
  - Controlled vs uncontrolled semantics are clear and well-documented in the component comments.
  - `forwardRef` API is typed and exposes only `start()` and `stop()` methods (and a read-only `isActive` boolean if needed).
  - Component cleans up side-effects on unmount and does not use global timers without cleanup.
  - Tests cover both prop-driven and imperative control paths and the neutral marker behavior.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test -- --testPathPattern=ThoughtPulse.control.test.tsx` and confirm all assertions pass.

## 5. Update Documentation
- [ ] Update `docs/ui/thought_pulse.md` with the control API examples showing both prop-driven usage and the `ref`-based imperative API, including code snippets:
  - Controlled example: `<ThoughtPulse active={isThinking} />`.
  - Imperative example: `const ref = useRef(); ref.current.start(); ref.current.stop();`.
  - Document neutral behavior and how to style `--thought-pulse-neutral-marker`.

## 6. Automated Verification
- [ ] CI check: run `pnpm test -- --testPathPattern=ThoughtPulse` (all ThoughtPulse tests should pass). Additionally run an integration smoke test that mounts the component in a headless browser (playwright/jest-puppeteer) if available and asserts start/stop toggle events visually by checking class presence.
