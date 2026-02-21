# Task: Implement Virtual History Stack (Sub-Epic: 09_View_Routing_Arch)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-064]

## 1. Initial Test Written
- [ ] Create a Vitest test suite for `useHistory.test.tsx`.
- [ ] Write a test that confirms a new view is correctly pushed onto the history stack.
- [ ] Write a test that validates that `goBack()` correctly pops the current view and returns the previous one.
- [ ] Write a test that validates that `goForward()` is possible if the user has previously gone back.
- [ ] Write a test that confirms that the history stack has a maximum depth of 10-20 items to prevent excessive memory usage.
- [ ] Write a test that confirms that the history state is persisted via `vscode.setState()` so it survives Webview reloads.

## 2. Task Implementation
- [ ] Create a `useHistory` custom hook in `@devs/vscode-webview/src/hooks/useHistory.ts`.
- [ ] Implement a `HistoryStack` interface that includes a `stack` array, `currentIndex`, `push()`, `goBack()`, and `goForward()`.
- [ ] Integrate this hook into the `RouterProvider` so that `navigateTo()` uses the `push()` operation by default.
- [ ] Implement a `replace()` operation for use-cases like switching views after a HITL gate is passed.
- [ ] Ensure that the current view is always at the top of the stack after a `push()`.
- [ ] Add support for "Back" and "Forward" keyboard shortcuts (Cmd+[ and Cmd+]) if required by the TAS.

## 3. Code Review
- [ ] Verify that the `HistoryStack` logic handles edge cases like calling `goBack()` when the stack is empty.
- [ ] Confirm that `goForward()` works as expected after multiple `goBack()` calls.
- [ ] Ensure that the stack is correctly serialized and deserialized from `vscode.getState()`.
- [ ] Confirm that the state transition doesn't cause unnecessary re-renders of unrelated components.

## 4. Run Automated Tests to Verify
- [ ] Execute the `useHistory.test.tsx` suite and ensure all tests pass.
- [ ] Verify that the integrated `RouterProvider` tests (from Task 01) still pass.

## 5. Update Documentation
- [ ] Update the `ROUTING.md` document with a section on the Virtual History Stack and how navigation state is persisted.

## 6. Automated Verification
- [ ] Run a script that simulates a series of navigation events and verifies that the history state matches the expected stack.
- [ ] Ensure the build (`pnpm build`) succeeds without any type issues.
