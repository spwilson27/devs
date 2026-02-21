# Task: Implement Hard Redirects for HITL Gates (Sub-Epic: 10_View_Lifecycle_Policy)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-063]

## 1. Initial Test Written
- [ ] Write an integration test for the `ViewRouter` using `@testing-library/react`. Mock the Zustand store's `orchestratorState`. Initially set the state to `IMPLEMENTING`. Change the state to `WAITING_FOR_APPROVAL` and assert that `window.location.hash` changes to `#/spec` within 100ms.
- [ ] Write a unit test for the `useHITLGateRedirect` hook. Verify that it only triggers a navigation event *once* upon the transition to `WAITING_FOR_APPROVAL`.

## 2. Task Implementation
- [ ] Create a `useHITLGateRedirect` custom hook in `@devs/ui-hooks`. Subscribe to the `orchestratorState` property in the project store.
- [ ] Implement the redirect logic: If `orchestratorState === 'WAITING_FOR_APPROVAL'` AND the current view is not `SPEC_VIEW`, trigger a hard redirect using the router's `navigate()` function.
- [ ] In the `ViewRouter` component, ensure the redirect logic is applied at the root level of the app.
- [ ] If the user navigates away from the approval view while the state is still `WAITING_FOR_APPROVAL`, re-trigger the redirect after a 5-second "Grace Period" if the approval has not been granted.

## 3. Code Review
- [ ] Ensure that the redirect does not trigger if the user is *already* on the `SPEC_VIEW` or an equivalent approval view.
- [ ] Verify that the state listener is debounced to avoid multiple redirects if the store updates frequently.
- [ ] Check for any potential conflicts with the `Incremental View Unlocking` policy (the approval view MUST be unlocked if the state is `WAITING_FOR_APPROVAL`).

## 4. Run Automated Tests to Verify
- [ ] Execute `vitest src/router/__tests__/HITLRedirect.test.tsx` to verify the redirect logic.
- [ ] Verify that the navigation event is logged in the `agent_logs` table (if integration is enabled).

## 5. Update Documentation
- [ ] Update the `UI/UX Architecture` document to include the `HITL Hard Redirect` policy.
- [ ] Record the redirect behavior in the Agent "Memory" to ensure agents understand why the user's focus is forced to specific views.

## 6. Automated Verification
- [ ] Use the `devs simulate-approval-block` script to verify that the Webview correctly forces navigation to the `SPEC_VIEW`.
