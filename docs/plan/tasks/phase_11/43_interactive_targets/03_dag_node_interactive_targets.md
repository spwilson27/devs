# Task: Ensure DAG node ports and action icons meet 24px interactive target minimum (Sub-Epic: 43_Interactive_Targets)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-048], [7_UI_UX_DESIGN-REQ-UI-DES-048-1]

## 1. Initial Test Written
- [ ] Add unit tests at packages/webview/src/components/DAGNode/__tests__/DAGNode.interactive.test.tsx that:
  - Render a DAGNode with mock ports/actions
  - Query for node ports and action buttons via getAllByTestId('node-port') / getAllByTestId('node-action')
  - Assert that each returned element has class "interactive-target" and dataset attribute data-interactive-size === '24'
  - Assert keyboard focus target: simulate keyboard Tab to ensure each interactive-target is focusable (tabIndex >= 0 or button element)
- [ ] Ensure tests run with: npm test -- packages/webview -- -t DAGNode.interactive

## 2. Task Implementation
- [ ] Update the DAG node renderer (likely packages/webview/src/components/DAGNode.tsx or similar) to wrap small clickable icons (ports, mini-actions) with a semantic element that satisfies the interactive target:
  - Wrap icons with <button className="interactive-target" data-interactive-size="24" aria-label="...">icon</button>
  - If DOM structure requires <svg> click handlers, place a visually-hidden but focusable <button> overlay sized to 24x24 that forwards events to the SVG element.
- [ ] Add CSS utility (or Tailwind class) for .interactive-target to guarantee minimum size and centering:
  - .interactive-target { display:inline-flex; align-items:center; justify-content:center; min-width:24px; min-height:24px; padding:4px; border-radius:4px; }
- [ ] Update DAGCanvas hit-testing logic (if any) to account for the padded hit area so clicks on the padded zone route to the intended handler.

## 3. Code Review
- [ ] Verify that every visual port or action in DAGNode has a corresponding focusable element at least 24x24.
- [ ] Confirm no overlapping clickable areas that steal focus or make tab order ambiguous.
- [ ] Confirm that any invisible overlays used for sizing are accessible (aria-hidden where appropriate) and that keyboard focus lands on the semantic control.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- packages/webview -- -t DAGNode.interactive and confirm tests pass.
- [ ] Manually run the DAG view locally and test keyboard navigation through ports (Tab / Shift+Tab) to confirm focus order.

## 5. Update Documentation
- [ ] Update docs/ui/interactive-targets.md and docs/ui/dag-guidelines.md with examples showing how to wrap icons to meet 24px minimum and code snippets demonstrating the recommended pattern.

## 6. Automated Verification
- [ ] Add a lightweight static analyzer script scripts/check-interactive-targets.js that scans packages/webview/src/components for usage of interactive elements (look for 'interactive-target' class or data-interactive-size attributes) and fails if any port/action component lacks this marker; wire it into CI pre-checks.