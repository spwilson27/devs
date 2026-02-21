# Task: Navigation State Persistence & Re-hydration (Sub-Epic: 08_Persistence_Recovery)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-066]

## 1. Initial Test Written
- [ ] Create integration tests for the `ViewRouter` or navigation hook.
- [ ] Mock the `WebviewStateManager` created in Task 01.
- [ ] Verify that navigating to a new view (e.g., from DASHBOARD to CONSOLE) triggers a call to `WebviewStateManager.saveState`.
- [ ] Verify that on component mount, the router initializes with the value retrieved from `WebviewStateManager.loadState`.

## 2. Task Implementation
- [ ] Locate the primary navigation controller (e.g., `useRouter` or `AppRouter` component).
- [ ] Integrate `WebviewStateManager` into the navigation state change logic.
- [ ] Update the `navigate(view, params)` function to immediately call `vscode.setState()` (via the utility) with the new `viewMode` and `activeTaskId`.
- [ ] Implement a "Re-hydration" effect in the root component:
    - On mount, call `WebviewStateManager.loadState()`.
    - If a valid `viewMode` exists, update the application's global state (Zustand) to restore the view.
    - If an `activeTaskId` exists, ensure the relevant task context is loaded.

## 3. Code Review
- [ ] Verify that the re-hydration logic handles edge cases (e.g., saved view no longer exists or is locked).
- [ ] Ensure that `vscode.setState()` is called synchronously with the navigation transition to prevent state loss on sudden disposal.
- [ ] Check for any "race conditions" where the initial default state might overwrite the re-hydrated state.

## 4. Run Automated Tests to Verify
- [ ] Run integration tests for navigation.
- [ ] Manually verify in the VSCode Extension Development Host that closing and reopening the Webview restores the last active view.

## 5. Update Documentation
- [ ] Update the Phase 11 architectural summary in `docs/` to reflect how navigation state is persisted.

## 6. Automated Verification
- [ ] Run a lint check to ensure no unauthorized usage of raw `window.postMessage` for state management; all should go through the `WebviewStateManager`.
