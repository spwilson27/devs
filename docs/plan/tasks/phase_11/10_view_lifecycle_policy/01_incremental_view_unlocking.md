# Task: Implement Incremental View Unlocking Policy (Sub-Epic: 10_View_Lifecycle_Policy)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-062]

## 1. Initial Test Written
- [ ] Write a unit test for the `useViewUnlocking` hook in `@devs/ui-hooks`. Mock the project phase from the Zustand store (e.g., `INIT`, `RESEARCH`). Assert that attempting to access `RESEARCH_VIEW` is flagged as `isLocked: true` if the project is in the `INIT` phase.
- [ ] Write an integration test for the `ViewRouter` component. Render the router with a project phase of `DESIGN`. Assert that navigation to `#/roadmap` (a Phase 3 view) is redirected to `#/spec` (the active phase's primary view).

## 2. Task Implementation
- [ ] Create a `ViewUnlockPolicy` mapping in `@devs/vscode-webview/src/router/policy.ts`. Define which views are permitted for each project phase:
  - `INIT` -> `[DASHBOARD, SETTINGS]`
  - `RESEARCH` -> `[DASHBOARD, RESEARCH_VIEW, SETTINGS]`
  - `DESIGN` -> `[DASHBOARD, RESEARCH_VIEW, SPEC_VIEW, SETTINGS]`
  - `DISTILLATION` -> `[DASHBOARD, RESEARCH_VIEW, SPEC_VIEW, ROADMAP_VIEW, SETTINGS]`
  - `IMPLEMENTATION` -> `[ALL]`
- [ ] Implement a `PhaseGuard` component in the `ViewRouter` that wraps each route. The guard must check the current phase from the global store and the policy mapping.
- [ ] If a user navigates to a locked route, perform a silent redirect to the current phase's primary dashboard and show a non-intrusive warning message.

## 3. Code Review
- [ ] Verify that the unlocking logic is "Inclusive" (e.g., once you reach `DESIGN`, `RESEARCH` views remain unlocked).
- [ ] Ensure that the `SETTINGS` and `DASHBOARD` views are always accessible regardless of the project phase.
- [ ] Check for any potential infinite redirect loops if the fallback view is also locked.

## 4. Run Automated Tests to Verify
- [ ] Execute `vitest src/router/__tests__/ViewRouter.test.tsx` to verify the guard logic.
- [ ] Run `npm run lint` in the webview package to ensure architectural compliance.

## 5. Update Documentation
- [ ] Update the `@devs/vscode` agent documentation (`.agent.md`) to reflect the new navigation restriction policy.
- [ ] Document the phase-to-view mapping in the `UI/UX Architecture` spec if not already detailed.

## 6. Automated Verification
- [ ] Run the `verify-view-guards.sh` script to confirm that all defined routes in `ViewRouter` are correctly wrapped by the `PhaseGuard`.
