# Task: Implement red-screen security alert overlay for security violations (Sub-Epic: 47_Security_Shield_CSP)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-028]

## 1. Initial Test Written
- [ ] Write unit tests for a new React component `RedScreenAlert` under `packages/ui/__tests__/RedScreenAlert.test.tsx` that verifies:
  - The component renders a full-screen overlay with the expected ARIA attributes (`role="alertdialog"`, `aria-live="assertive"`).
  - The overlay visually covers the entire app (asserts container style or bounding client rect in DOM testing).
  - The overlay blocks pointer events to underlying content and offers an explicit action (e.g., "View Incident" and "Acknowledged") exposed as buttons.
- [ ] Add an integration test that simulates the extension host sending a postMessage `postMessage({ type: 'security.alert', payload })` to the webview and asserts the overlay appears and the payload is rendered in a restricted incident details panel.

## 2. Task Implementation
- [ ] Implement `RedScreenAlert` React component in `packages/ui/src/components/RedScreenAlert.tsx` with the following characteristics:
  - Full-screen fixed-position overlay with the red color token from design (use `--vscode-theme-override` variables, do not hardcode hex values).
  - Focus-trap behavior: when the overlay opens, focus moves into the overlay and cannot escape until an authorized action occurs.
  - Accessibility: `role="alertdialog"`, `aria-label` describing the security incident, and keyboard support for the acknowledgement action.
  - Incident details area shows a sanitized and validated set of fields: `timestamp`, `violationType`, `summary`, and `incidentId` (no HTML injection allowed — escape or render as plain text).
- [ ] Wire the overlay to the webview message handler (`window.addEventListener('message', handler)`) to respond to `security.alert` messages coming from the extension host. The handler must validate the message shape and only accept messages with `type === 'security.alert'` and fields matching a tight JSON schema.
- [ ] Ensure the overlay cannot be triggered by arbitrary client scripts: messages must be sent by the extension host via `vscode.postMessage` and verified using a short-lived token negotiation (see sandbox breach task) or by verifying a server-sourced incident id via extension host.

## 3. Code Review
- [ ] Confirm overlay uses design tokens rather than hardcoded colors.
- [ ] Confirm incident payload is sanitized and rendered as plain text; no dangerouslySetInnerHTML usage.
- [ ] Confirm focus trap, keyboard navigation, and screen-reader announcements meet accessibility requirements.
- [ ] Confirm the overlay open/close is audited in telemetry and incident logs and that dismiss/acknowledge actions are gated to authorized actors where applicable.

## 4. Run Automated Tests to Verify
- [ ] Unit tests: `cd packages/ui && npm run test -- RedScreenAlert`.
- [ ] Integration/e2e: Use the headless browser harness (Puppeteer or Playwright) to load a development webview HTML and simulate `window.postMessage` from the extension host, then assert DOM state changes.

## 5. Update Documentation
- [ ] Update `docs/ui-and-security.md` (or `docs/security.md`) with the `RedScreenAlert` design spec: when it should be triggered, what information is shown, how to acknowledge incidents, and developer guidance on sending `security.alert` messages from host code.

## 6. Automated Verification
- [ ] Add an e2e script `scripts/verify-red-screen-alert.js` that spins up the webview HTML in a headless browser, programmatically posts a `security.alert` message, and verifies the overlay appears, is accessible, and that acknowledgement tab completes an expected round-trip to the extension host (mocked).
- [ ] Hook `scripts/verify-red-screen-alert.js` into CI checks for UI changes that touch message handling or security UI.
