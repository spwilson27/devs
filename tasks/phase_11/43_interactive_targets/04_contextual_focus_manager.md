# Task: Implement Contextual Focus Manager and integrate roving tabindex for contextual focus (Sub-Epic: 43_Interactive_Targets)

## Covered Requirements
- [4_USER_FEATURES-REQ-055]

## 1. Initial Test Written
- [ ] Unit tests: packages/ui/src/lib/__tests__/focus-manager.test.ts
  - Test the FocusManager API: register(containerId, getFocusable), setContext(contextId, anchorSelector), focusAnchor(contextId), restorePreviousContext()
  - Assert that when setContext is called the appropriate element receives document.activeElement and that tabindex values are updated according to the roving tabindex pattern.
- [ ] E2E tests (Cypress): cypress/integration/contextual-focus.spec.ts
  - Start the app/webview locally, find a DAG node, press Tab to land on node action, simulate keyboard commands (Arrow keys, Enter) and assert focus moves to the contextual primary control.

## 2. Task Implementation
- [ ] Implement a FocusManager at packages/ui/src/lib/focusManager.ts with a minimal, well-typed API:
  - register(containerId: string, getFocusable: () => HTMLElement[]) -> returns unregister()
  - setContext(contextId: string, anchorQuery: string | (elements) => HTMLElement | null)
  - focusNext()/focusPrevious() for arrow-key navigation within context
  - restorePreviousContext() to return focus on context dismissal
- [ ] Integrate FocusManager into DAGCanvas and StandardButton:
  - On node selection: focusManager.setContext(nodeId, '.node-primary-action') and call focusManager.focusAnchor(nodeId)
  - Ensure components forward refs so FocusManager can call element.focus()
- [ ] Implement Roving TabIndex pattern: containers maintain a single tabindex=0 item while others are -1 and FocusManager moves tabindex as focus changes.

## 3. Code Review
- [ ] Verify separation of concerns: FocusManager is framework-agnostic (pure DOM operations) and components only register/unregister with it.
- [ ] Confirm there are no memory leaks: unregister is called at component unmount and references are cleaned up.
- [ ] Confirm keyboard handling does not block other global shortcuts and that key handlers are scoped to focused contexts.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: npm test -- packages/ui -- -t focus-manager
- [ ] Run Cypress E2E: npx cypress run --spec cypress/integration/contextual-focus.spec.ts (or project-specific e2e command) and confirm tests pass headlessly.

## 5. Update Documentation
- [ ] Add docs/accessibility/contextual-focus.md documenting the FocusManager API, developer patterns (how components register), and examples showing how to implement an anchor and restore behavior.

## 6. Automated Verification
- [ ] Add an e2e gate in CI that runs the contextual-focus.spec.ts and fails the pipeline if focus flows are broken; add a small health-check script scripts/verify-focus.js that programmatically exercises the FocusManager API and exits non-zero on unexpected results.