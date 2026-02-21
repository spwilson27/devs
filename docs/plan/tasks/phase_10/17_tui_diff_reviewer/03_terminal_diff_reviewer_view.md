# Task: Terminal Diff Reviewer Integration (Sub-Epic: 17_TUI Diff Reviewer)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-070]

## 1. Initial Test Written
- [ ] Create an integration test for `DiffReviewerScreen` in `@devs/cli/tui/views/DiffReviewerScreen.tsx`.
  - [ ] Mock a set of changes (e.g., TAS requirement updates) with associated diff strings.
  - [ ] Verify that as the user moves focus through the sign-off list, the `UnifiedDiffView` updates to show the diff of the currently focused item.
  - [ ] Verify that pressing `Enter` with multiple items selected triggers the approval logic (calling a mock API or dispatching an action).

## 2. Task Implementation
- [ ] Implement `DiffReviewerScreen` component:
  - [ ] Layout the screen with two main zones: a sidebar/top list for `MultiSelectSignoff` and a main area for `UnifiedDiffView`.
  - [ ] Synchronize state: the `focusedIndex` from the `MultiSelectSignoff` determines which diff is passed to `UnifiedDiffView`.
  - [ ] Add a header indicating "Diff Reviewer: Approve Changes to TAS/PRD".
  - [ ] Add a footer with instruction shortcuts: `[Space] Toggle`, `[Enter] Sign-off Selected`, `[Esc] Cancel`.
- [ ] Integrate with the `@devs/cli` state (e.g., Zustand store):
  - [ ] Fetch pending changes from the store.
  - [ ] On `Enter`, call the store's action to approve selected requirements.

## 3. Code Review
- [ ] Ensure the layout is responsive to terminal resizing (handling cases where the diff might be too wide or too tall).
- [ ] Verify that the interaction feels "keyboard-first" and snappy.
- [ ] Check that secret redaction is applied to the diff content before it is rendered (if not already handled by the source data).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test @devs/cli` to verify the integration tests pass.

## 5. Update Documentation
- [ ] Update the Phase 10 implementation status in `phases/phase_10.md` or a central tracking file.
- [ ] Update user documentation to explain how to use the terminal diff reviewer.

## 6. Automated Verification
- [ ] Execute `devs status` (or a mock command that triggers the reviewer) in a controlled terminal environment and verify the screen renders correctly with mock data.
