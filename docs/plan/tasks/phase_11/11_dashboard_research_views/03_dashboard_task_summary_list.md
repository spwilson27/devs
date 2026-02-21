# Task: Dashboard Project Task Tree Summary (Sub-Epic: 11_Dashboard_Research_Views)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-054]

## 1. Initial Test Written
- [ ] Create a unit test for a `TaskSummaryList` component to verify it renders a flat or tree list of tasks from a project state array.
- [ ] Write a test for a `TaskBadge` component to ensure it applies the correct color-coded state (PENDING, SUCCESS, FAILED) based on task status.
- [ ] Implement an integration test for the `DashboardView` to verify that selecting a task from the `TaskSummaryList` correctly updates the active task ID in the project store.

## 2. Task Implementation
- [ ] Create the `TaskSummaryList` component in `src/webview/components/Dashboard/TaskSummaryList.tsx`.
- [ ] Create the `TaskBadge` component in `src/webview/components/Common/TaskBadge.tsx` that utilizes `6_UI_UX_ARCH-REQ-019` for status differentiation.
- [ ] Within the `DashboardView`, implement a "Navigation Zone" (7_UI_UX_DESIGN-REQ-UI-DES-044-2) that displays the `TaskSummaryList` for the active Epic.
- [ ] Use `vscode-resource` URI scheme for any icons in the task list (6_UI_UX_ARCH-REQ-074).
- [ ] Implement a search/filter field at the top of the `TaskSummaryList` to filter tasks by ID or title.
- [ ] Ensure that selecting a task correctly triggers a `postMessage` to the extension host if a side-effect (like opening a file) is required.
- [ ] Implement a "Show More" or virtualized scrolling for the list if it exceeds 50 tasks (6_UI_UX_ARCH-REQ-046).

## 3. Code Review
- [ ] Verify that the `TaskSummaryList` correctly handles the "No Active Epic" state.
- [ ] Ensure that clicking a task does not cause a full-view re-render of the `DashboardView`.
- [ ] Check that the component adheres to the 24px minimum interactive target from `7_UI_UX_DESIGN-REQ-UI-DES-048-1`.

## 4. Run Automated Tests to Verify
- [ ] Execute tests to confirm that filtering logic correctly handles case-insensitivity and special characters.
- [ ] Verify that the list correctly updates when the project state in the Zustand store changes (STATE_CHANGE event streaming).

## 5. Update Documentation
- [ ] Log the navigation logic and inter-component communication patterns between the `TaskSummaryList` and the `ViewRouter`.
- [ ] Update the `DASHBOARD_VIEW.agent.md` documentation to include the task list interaction details.

## 6. Automated Verification
- [ ] Run a test script to programmatically verify that the `TaskSummaryList` correctly maps to the `tasks` array in the project state.
