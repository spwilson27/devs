# Task: Multi-Select Sign-off Component (Sub-Epic: 17_TUI Diff Reviewer)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-070-2]

## 1. Initial Test Written
- [ ] Create a component test for `MultiSelectSignoff` in `@devs/cli/tui/components/MultiSelectSignoff.tsx` using `ink-testing-library`.
  - [ ] Mock a list of items (requirements) with `id`, `label`, and `selected` state.
  - [ ] Simulate a `Space` key press and verify that the 'selected' state of the focused item toggles.
  - [ ] Simulate `ArrowUp` and `ArrowDown` to ensure focus moves between items.
  - [ ] Verify that selected items are rendered with a "checked" checkbox icon (e.g., `[x]`) and unselected with `[ ]`.

## 2. Task Implementation
- [ ] Implement `MultiSelectSignoff` component using `ink-select-input` (if available/suitable) or a custom implementation with `useInput` and `useState`.
  - [ ] Maintain an internal state of selected item IDs.
  - [ ] Render each item as a line with a checkbox prefix.
  - [ ] Handle `Space` key to toggle the current item.
  - [ ] Handle `Enter` key to submit the current selection (trigger an `onConfirm` callback).
  - [ ] Ensure focus is visible (e.g., highlighting the current line or using a pointer).

## 3. Code Review
- [ ] Verify that the component follows the "Minimalist Authority" philosophy: clean layout, no unnecessary animations.
- [ ] Ensure it uses the global focus management system if one exists in `@devs/cli/tui`.
- [ ] Check that `ink-select-input` is used as requested in the requirement if it fits the multi-select use case; otherwise, document the deviation if a custom component is better for multi-select.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test @devs/cli` to verify the `MultiSelectSignoff` tests pass.

## 5. Update Documentation
- [ ] Document the component's props and usage in the TUI component library section of the AOD.

## 6. Automated Verification
- [ ] Run a test script that mounts the component, simulates a sequence of keys (`Down`, `Space`, `Down`, `Space`, `Enter`), and asserts that the `onConfirm` callback receives the expected IDs.
