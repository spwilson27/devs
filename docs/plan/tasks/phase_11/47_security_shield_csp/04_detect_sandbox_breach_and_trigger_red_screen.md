# Task: Detect sandbox breaches via CSP violations and trigger red-screen alert (Sub-Epic: 47_Security_Shield_CSP)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-122]

## 1. Initial Test Written
- [ ] Add unit tests `securitypolicy-listener.test.ts` that run in a DOM-like environment (Jest + jsdom) verifying that a `securitypolicyviolation` event handler:
  - Is registered as early as possible in the webview runtime (before third-party scripts run).
  - Packages a strict, typed payload containing `violatedDirective`, `blockedURI`, `sourceFile`, `lineNumber`, `columnNumber`, `timestamp` and sends it to the extension host via `vscode.postMessage({ type: 'security.policy.violation', payload })`.
- [ ] Add an integration test that simulates a CSP violation by injecting a script that violates the policy in a headless browser against a built webview (use Puppeteer) and assert that the extension host handler receives the correctly structured message and responds by sending a `security.alert` message back to the webview which in turn renders the RedScreen overlay.

## 2. Task Implementation
- [ ] In the webview top-level bootstrap script (`packages/vscode/src/webview/bootstrap.ts` or the equivalent), register an early, non-overridable `window.addEventListener('securitypolicyviolation', handler, true)` where `handler`:
  - Extracts the canonical fields from the event (see tests above).
  - Immediately posts a message to the extension host using `vscode.postMessage({ type: 'security.policy.violation', payload })`.
  - Persists the event locally in the webview memory and attempts to gracefully degrade the UI (optionally show an interim overlay) while awaiting extension host instructions.
- [ ] On the extension host side (`packages/vscode/src/handlers/securityHandler.ts`):
  - Listen for `security.policy.violation` messages from the webview process.
  - Validate the payload against a strict schema and create an incident record in an on-disk incident log (append-only file) or write to the project telemetry store.
  - Emit a canonical `security.alert` message back to the webview with `incidentId`, `summary`, and `recommendedAction` fields. The webview will then show the `RedScreenAlert` using that canonical structure.
- [ ] Ensure the message exchange enforces anti-spoofing by validating message origins or using a short-lived token negotiated at webview creation time (for example: webview creation returns an ephemeral token embedded in the webview's `vscode.getState()` that must be mirrored in the message payloads).

## 3. Code Review
- [ ] Confirm the `securitypolicyviolation` listener is attached before any third-party/extension code runs and that it cannot be replaced by page scripts (freeze handler references where possible).
- [ ] Confirm payload validation on the host side is strict and rejects malformed attempts.
- [ ] Confirm the incident logging is append-only, tamper-resistant (basic file permissions), and that no PII is written to telemetry by default.

## 4. Run Automated Tests to Verify
- [ ] Unit tests: `cd packages/vscode && npm run test -- securitypolicy-listener.test.ts`.
- [ ] Integration/e2e: Run Puppeteer scenario which loads the built webview bundle, injects a violating script, and asserts the full flow (event -> host log -> host sends security.alert -> RedScreen overlay shown).

## 5. Update Documentation
- [ ] Update `docs/security-incident-flow.md` describing the end-to-end flow: `securitypolicyviolation` -> host validation -> incident log -> `security.alert` -> user acknowledgement.
- [ ] Document how operators can query the incident log, the retention policy, and how to disable/opt-out non-essential telemetry for privacy.

## 6. Automated Verification
- [ ] Add `scripts/verify-sandbox-breach-flow.js` which builds the webview bundle with a test CSP, spins up a headless browser, injects a violating script to trigger the `securitypolicyviolation` event, and asserts the host receives the message and the webview renders the RedScreen overlay.
- [ ] Ensure `scripts/verify-sandbox-breach-flow.js` runs in CI for any changes to webview message handling, CSP, or the RedScreen component.
