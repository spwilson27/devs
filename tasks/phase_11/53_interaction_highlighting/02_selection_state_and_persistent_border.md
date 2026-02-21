# Task: Implement Node Selection State & Persistent Border (Sub-Epic: 53_Interaction_Highlighting)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-055-2]

## 1. Initial Test Written
- [ ] Create a unit test at src/components/DAG/__tests__/Node.selection.test.tsx:
  - Render the Node component inside a minimal mocked global UI store (Zustand) exposing get/setSelectedNode.
  - Simulate fireEvent.click(nodeEl).
  - Assert setSelectedNode was called with the node id.
  - Assert the node wrapper has an applied persistent border: nodeEl.style.border === '3px solid var(--devs-primary)' OR nodeEl.classList.contains('node--selected').
  - Assert the node has appropriate ARIA state: nodeEl.getAttribute('aria-pressed') === 'true' when selected.

## 2. Task Implementation
- [ ] Update the global UI store (e.g., src/state/uiStore.ts or src/store/ui.ts):
  - Add state selectedNodeId: string | null and action setSelectedNode(id: string | null).
  - Optionally persist selection to webview state (vscode.getState) if required by UX.
- [ ] Update src/components/DAG/Node.tsx to:
  - Call setSelectedNode(id) on click.
  - Compute isSelected = selectedNodeId === id and apply style or class:
    style={{ border: isSelected ? '3px solid var(--devs-primary)' : undefined }} and data-selected={isSelected}.
  - Add role="button" and aria-pressed={isSelected} for keyboard accessibility and screen readers.
  - Prefer outline or box-shadow if border causes layout shift; ensure visual matches spec (3px solid var(--devs-primary)).
- [ ] Add keyboard handlers to allow selection via Enter/Space.

## 3. Code Review
- [ ] Verify selection state is centralized and observable by other components such as DAGCanvas.
- [ ] Confirm border uses CSS variable var(--devs-primary) and exact width of 3px and that layout does not shift; use outline fallback where necessary.
- [ ] Ensure ARIA attributes are correct and test coverage is sufficient.

## 4. Run Automated Tests to Verify
- [ ] Run the unit test: npm test -- --testPathPattern=Node.selection.test.tsx and ensure passing.

## 5. Update Documentation
- [ ] Update docs/ui/interaction_highlighting.md to describe the selected state API, store keys, and UX expectations (how selection appears and how to clear selection).

## 6. Automated Verification
- [ ] Run jest with JSON output and assert the Node.selection.test.tsx test passes; optionally run a small script that mounts the component and asserts the DOM shows the 3px border when a selection is simulated.

Commit notes: open a PR that adds the store key, Node selection wiring, tests, and documentation; include Co-authored-by trailer in commit message.
