# Task: Build the ApprovalGate UI Component (Sub-Epic: 16_TUI Approval Gates & Interaction)

## Covered Requirements
- [9_ROADMAP-REQ-INT-001]

## 1. Initial Test Written
- [ ] Create a test in `@devs/cli/tests/tui/components/ApprovalGate.test.tsx` using `ink-testing-library`.
- [ ] Verify that the component renders a title and a clear set of instructions for the user (e.g., "[Enter] to Approve, [Esc] to Reject").
- [ ] Verify that different statuses (e.g., "PENDING", "APPROVED", "REJECTED") render with correct semantic coloring (Success color vs Error color).

## 2. Task Implementation
- [ ] Create the `ApprovalGate` component in `@devs/cli/src/tui/components/ApprovalGate.tsx`.
- [ ] Use `Box`, `Text`, and `Newline` from Ink to create a structured layout.
- [ ] Implement styling for the "Double-line Border" focus indicator when the gate is active.
- [ ] Integrate with the project's ANSI palette for consistent coloring of the approval status badges.

## 3. Code Review
- [ ] Ensure the UI follows the "Minimalist Authority" aesthetic from `7_UI_UX_DESIGN-REQ-UI-DES-060`.
- [ ] Verify that the component is responsive to container width changes.
- [ ] Check that Unicode box-drawing characters are used correctly for borders.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm test -- @devs/cli/tests/tui/components/ApprovalGate.test.tsx` and ensure the snapshots and assertions pass.

## 5. Update Documentation
- [ ] Add the `ApprovalGate` component to the TUI component library documentation in `.agent/tui-primitives.md`.

## 6. Automated Verification
- [ ] Run `npm run lint:cli` to ensure the new component adheres to the project's coding standards.
