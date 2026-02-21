# Task: E2E: Massive Log Handling ("Read More") & Accessibility (Sub-Epic: 59_Log_Windowing_Core)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-097], [6_UI_UX_ARCH-REQ-094]

## 1. Initial Test Written
- [ ] Create an E2E test at tests/e2e/console_readmore.test.ts using Playwright or Puppeteer. The E2E must perform the following steps:
  - Launch a headless instance of the Webview component (or an instrumented storybook page hosting VirtualizedConsole) and inject 20,000 synthetic logs into the system via the BatchBuffer.
  - Verify the UI starts by showing the most recent tail (last page) and exposes a "Read More" control at the top of the ConsoleView.
  - Click the "Read More" control repeatedly until older pages are exhausted; after each click assert:
    - Older logs are prepended in chronological order.
    - The visual viewport's first visible message remains the same message (i.e., the scroll position is preserved visually).
  - Verify that the DOM node count remains O(viewport_size) while older pages are loaded (use devtools protocol to measure node counts or sample mounted rows).
  - Verify keyboard accessibility for the Read More control (focusable via keyboard and activatable with Enter/Space).

## 2. Task Implementation
- [ ] Implement the Read More UI in src/webview/console/ReadMoreControl.tsx and integrate it into VirtualizedConsole:
  - Control props: onReadMore():Promise<void>, disabled:boolean
  - Implement visual affordance and keyboard focus handling; add aria-label and role attributes for accessibility.
  - Ensure when older pages are prepended the VirtualizedConsole computes and sets scrollTop such that the previously visible content remains in view (use measured scrollHeight delta adjustment strategy).
  - Add a small analytics event (non-blocking) to record read-more clicks for future telemetry.

## 3. Code Review
- [ ] PR reviewer must confirm:
  - Read More preserves scroll visual position after prepends across browsers.
  - Keyboard focus is handled and control has accessible labels.
  - DOM node counts are preserved under heavy E2E scenarios.

## 4. Run Automated Tests to Verify
- [ ] Execute the E2E test locally and in CI: e.g., npx playwright test tests/e2e/console_readmore.test.ts or the project's E2E runner. Confirm the test passes and the UI remains responsive.

## 5. Update Documentation
- [ ] Update docs/phase_11/59_log_windowing_core/design.md with a short E2E summary, steps to reproduce, and a note about accessibility attributes used for the Read More control.

## 6. Automated Verification
- [ ] Add tests/e2e/verify_memory_and_dom.sh that runs the E2E and captures heap and node counts; fail if memory grows unbounded or DOM nodes exceed a threshold (e.g., > 5x viewport node count).
