# Task: Implement Phase-Based Access Guards for Spec and Roadmap Views (Sub-Epic: 12_Spec_Roadmap_Views)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-056], [6_UI_UX_ARCH-REQ-057]

## 1. Initial Test Written
- [ ] Write a suite of tests for the `ViewRouter` (or a navigation guard component) that verifies:
  - Navigation to `SPEC` view is allowed when project phase is `BLUEPRINTING` (Phase 2) or later.
  - Navigation to `SPEC` view is blocked when project phase is `DISCOVERY` (Phase 1).
  - Navigation to `ROADMAP` view is allowed when project phase is `DISTILLATION` (Phase 3) or later.
  - Navigation to `ROADMAP` view is blocked when project phase is `BLUEPRINTING` (Phase 2).
- [ ] Verify that blocked navigation redirects to a "Locked" state or back to the `DASHBOARD`.

## 2. Task Implementation
- [ ] Implement the access control logic within `src/webview/components/ViewRouter.tsx` or a custom `useViewAccess` hook.
- [ ] Ensure the project's current phase is retrieved from the global state (e.g., Zustand store).
- [ ] Create a `ViewLocked.tsx` placeholder component to show when a user attempts to access a view that is not yet unlocked.
- [ ] Update the sidebar or navigation menu to visually indicate if a view is "locked" (e.g., a lock icon or grayscale styling).
- [ ] Ensure that even with manual navigation attempts (if possible), the view content remains protected by the guard.

## 3. Code Review
- [ ] Verify that the access logic is centralized and not duplicated across multiple components.
- [ ] Ensure the implementation follows the "Incremental View Unlocking" logic specified in the deliverables.
- [ ] Check for edge cases where the project phase state might be transiently null or undefined during initial hydration.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:webview` to execute the navigation guard tests.
- [ ] Manually verify (if possible in the environment) that clicking on "Roadmap" when in Phase 1 results in a "Locked" or fallback view.

## 5. Update Documentation
- [ ] Document the phase-based access rules in the `UI Architecture` documentation.
- [ ] Update the `phases/phase_11.md` status if necessary to reflect the implementation of these gates.

## 6. Automated Verification
- [ ] Run a specific test script that mocks different project states (Phase 1, 2, and 3) and asserts the correctly rendered view for each state.
