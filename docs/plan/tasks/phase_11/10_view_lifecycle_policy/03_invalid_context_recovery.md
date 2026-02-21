# Task: Implement Invalid Context Recovery (Sub-Epic: 10_View_Lifecycle_Policy)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-068]

## 1. Initial Test Written
- [ ] Write a unit test for the `useTaskContextValidator` hook in `@devs/ui-hooks`. Mock the `tasks` state with a list of tasks. Assert that `isValidTask('task-999')` returns `false` if `task-999` is not in the list.
- [ ] Write an integration test for the `TaskView` component. Render the component with a `taskId` of `task-999` in the URL. Assert that the component triggers a `navigate('/dashboard')` and calls the `toast.error()` function with the message "Task Not Found".

## 2. Task Implementation
- [ ] Create a `useTaskContextValidator` hook that checks the existence of a given `taskId` against the list of tasks in the `ProjectStore`.
- [ ] Implement a `TaskGuard` component in the `ViewRouter` that wraps the `/task/:taskId` route. The guard must perform the task existence check.
- [ ] If the `taskId` is invalid:
  - Trigger a redirect to `#/dashboard`.
  - Show a "Task Not Found" toast notification.
  - Log the invalid context recovery event to the `agent_logs` table.
- [ ] Add the `TaskGuard` to the `ViewRouter` configuration to ensure it intercepts all task-specific navigation.

## 3. Code Review
- [ ] Verify that the "Task Not Found" toast is only shown once during the recovery process.
- [ ] Ensure that the `ProjectStore` has already been hydrated before the `TaskGuard` performs its check to avoid false negatives.
- [ ] Check for any potential race conditions between data hydration and navigation.

## 4. Run Automated Tests to Verify
- [ ] Execute `vitest src/router/__tests__/TaskGuard.test.tsx` to verify the recovery logic.
- [ ] Run `npm run lint` in the webview package to ensure architectural compliance.

## 5. Update Documentation
- [ ] Update the `UI/UX Architecture` document to include the `Invalid Context Recovery` policy.
- [ ] Document the `Task Not Found` toast as a standard error-handling pattern in the UI.

## 6. Automated Verification
- [ ] Run the `verify-invalid-task-navigation.sh` script to confirm that navigating to a non-existent task ID always results in a fallback to the DASHBOARD.
