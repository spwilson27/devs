# Task: Accessibility & Keyboard Navigation for Sidebar (Sub-Epic: 44_Dashboard_Sidebar_Hub)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-090], [7_UI_UX_DESIGN-REQ-UI-DES-094]

## 1. Initial Test Written
- [ ] Add automated accessibility tests at packages/webview/src/__tests__/accessibility.test.ts using @testing-library/react and axe-core to assert:
  - No high or critical violations for the sidebar root, MultiAgentPanel, and TaskTree in both default and dense modes.
  - Keyboard navigation tests for TaskTree and agent list: ArrowUp/ArrowDown move selection, Enter opens details, Space toggles review mode.

## 2. Task Implementation
- [ ] Add ARIA roles and properties:
  - TaskTree should use role="tree" and each node role="treeitem" with aria-expanded when applicable.
  - Agent list should be role="list" with each item role="listitem" and provide aria-labels for status and role.
- [ ] Implement keyboard handlers:
  - Arrow keys to move focus between nodes/items; Home/End to jump; Enter to open; Space to toggle selection.
  - Ensure focus is always visible (focus ring) and that reduced-motion preferences are respected.

## 3. Code Review
- [ ] Confirm axe-core tests pass locally and in CI for default and high-contrast themes.
- [ ] Confirm focus order is logical and tabindex management doesn't trap focus.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- packages/webview/src/__tests__/accessibility.test.ts` plus `npx axe --save --reporter=json` against the rendered HTML to ensure zero critical violations.

## 5. Update Documentation
- [ ] Update docs/accessibility.md describing keyboard interactions, ARIA mappings, and the dense-mode tradeoffs for interactive target sizes.

## 6. Automated Verification
- [ ] CI step runs axe-core and fails if any critical or serious violations are detected; include screenshot capture for failures.
