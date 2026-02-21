# Task: Implement Narrow Mode Log Button (Sub-Epic: 60_Log_UI_Presentation)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-083-2-1]

## 1. Initial Test Written
- [ ] Create integration tests at src/components/LogWindow/__tests__/narrowMode.test.tsx using React Testing Library that validate the narrow-mode UX BEFORE implementation:
  - Test "narrow mode shows compact log button": render the parent ConsoleView with viewport width <= 720px (use window.innerWidth mocking) and assert a button exists with data-testid="log-toggle-button" and text "Logs".
  - Test "tapping button opens overlay with truncated log": simulate click on button and assert that an overlay (role="dialog" or data-testid="log-overlay") appears containing truncated log lines and a "Read more" control (data-testid="log-read-more").
  - Test keyboard accessibility: pressing Enter/Space on the button opens the overlay and focus is moved to the overlay first focusable element.

## 2. Task Implementation
- [ ] Implement a new UI component at src/components/LogWindow/LogToggleButton.tsx and an overlay component src/components/LogWindow/LogOverlay.tsx:
  - LogToggleButton: visible only in narrow mode (detected via CSS breakpoint or window width hook). Exposes data-testid="log-toggle-button" and is focusable.
  - LogOverlay: accessible dialog overlay (use role="dialog" and aria-modal="true") that renders the truncated LogWindow component (use truncateLogLines from logWindowing module). The overlay should have a close button with data-testid="log-overlay-close" and trap focus while open.
  - Wire ConsoleView (or BottomConsole) to render LogToggleButton when mode === 'narrow'. Use a small footprint Tailwind styling: fixed bottom-right with safe spacing.
  - Ensure the overlay supports keyboard escape to close and click-outside semantics.

## 3. Code Review
- [ ] Verify:
  - Accessibility: role, aria-modal, focus trapping, Escape to close, and keyboard activation for the toggle button.
  - No layout jank introduced; overlay uses fixed positioning inside the webview's shadow DOM.
  - Tests are deterministic and do not rely on real layout measurement; use mocking for window.innerWidth where necessary.

## 4. Run Automated Tests to Verify
- [ ] Execute the new integration tests: npm run test -- --testPathPattern=narrowMode --runInBand and confirm they pass. If using Playwright for E2E, provide a short Playwright test that verifies narrow-mode behavior at 360x800 viewport.

## 5. Update Documentation
- [ ] Update src/components/LogWindow/README.md with: narrow-mode behavior, breakpoint threshold (e.g., <=720px), how to style the toggle button, and required ARIA semantics. Add a short note in tasks/phase_11/60_log_ui_presentation/ mapping this task to 7_UI_UX_DESIGN-REQ-UI-DES-083-2-1.

## 6. Automated Verification
- [ ] Add an automated check (e.g., Playwright smoke test or RTL snapshot) in CI that runs a headless narrow viewport and asserts the toggle button exists and the overlay opens; fail the job if the assertions fail.