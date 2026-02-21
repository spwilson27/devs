# Task: Implement Active Task Card UI that surfaces the current REQ-ID (Sub-Epic: 42_Shadow_Task_Cards)

## Covered Requirements
- [4_USER_FEATURES-REQ-036]

## 1. Initial Test Written
- [ ] Add an integration/unit test at `packages/ui/src/components/ActiveTaskCard/__tests__/ActiveTaskCard.test.tsx` that:
  - Mocks the UI store or passes a prop representing the active task context `{ id: 'REQ-UI-123', title: 'Implement X' }`.
  - Renders `<ActiveTaskCard />` and asserts the DOM contains the REQ-ID string exactly (e.g., `REQ-UI-123`) and that it is visible to assistive technologies (e.g., role=region with aria-label containing `Active Task`).

## 2. Task Implementation
- [ ] Implement `packages/ui/src/components/ActiveTaskCard/ActiveTaskCard.tsx` with the following:
  - The component reads the current active task from the global UI store (Zustand) or accepts it as a prop; it must display the requirement ID (REQ-ID) prominently and include a small metadata line with the task title.
  - The visual appearance must use the TaskCard component (from task 03) with the appropriate elevation (e.g., `elevation='sm'`) so that Active Task Card visually aligns with design tokens.
  - Ensure the component exposes a hook or simple API for the agent to set the active task (e.g., `uiStore.setActiveTask({ id, title })`).

## 3. Code Review
- [ ] Verify the component consistently renders the REQ-ID, uses the TaskCard composable for styling (no duplicate shadow logic), is typed, and includes ARIA attributes (role and label) so screen readers announce the active task card.

## 4. Run Automated Tests to Verify
- [ ] Run the UI package test suite and the new ActiveTaskCard tests; confirm they pass. Additionally, run any available integration/e2e harness to render the UI router and set an active task programmatically, asserting the REQ-ID appears on screen.

## 5. Update Documentation
- [ ] Update `docs/ui/components.md` or `packages/ui/README.md` with example usage of `ActiveTaskCard`, show how to set the active task via the UI store API, and reference `4_USER_FEATURES-REQ-036`.

## 6. Automated Verification
- [ ] Add a small verification script `packages/ui/scripts/verify-active-card.js` that mounts the component (jsdom) with a test active task and asserts the presence of the REQ-ID; run this in CI as `verify:active-card`.
