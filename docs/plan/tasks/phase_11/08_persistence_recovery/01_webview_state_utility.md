# Task: Type-Safe VSCode Webview State Management Utility (Sub-Epic: 08_Persistence_Recovery)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-051], [6_UI_UX_ARCH-REQ-066]

## 1. Initial Test Written
- [ ] Create unit tests for a `WebviewStateManager` utility. 
- [ ] Mock the `vscode` global API, specifically `acquireVsCodeApi().getState()` and `acquireVsCodeApi().setState()`.
- [ ] Verify that `getState()` returns the expected typed object.
- [ ] Verify that `setState()` correctly calls the VSCode API with the provided payload and merges it with existing state if necessary.
- [ ] Ensure that invalid state types are caught at compile time (TypeScript).

## 2. Task Implementation
- [ ] Define a `WebviewState` interface that includes common persistent fields: `viewMode`, `activeTaskId`, `filters`, `transientStates` (map of view IDs to their transient data).
- [ ] Implement `WebviewStateManager` in `@devs/vscode-webview` (or the appropriate shared library).
- [ ] Use `acquireVsCodeApi()` to interact with the VSCode environment. Note: This should be called once and cached.
- [ ] Provide a `saveState(newState: Partial<WebviewState>)` method that performs a shallow merge with current state.
- [ ] Provide a `loadState(): WebviewState` method that returns the current persisted state or a default state if none exists.
- [ ] Ensure the utility handles the "headless" environment (e.g., when running in a browser during development) by falling back to `localStorage`.

## 3. Code Review
- [ ] Verify that the VSCode API is only acquired once.
- [ ] Ensure that state updates are efficient and don't cause unnecessary re-renders if used within a React hook.
- [ ] Check that the `WebviewState` interface is extensible.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` or the specific test suite for the persistence utility.
- [ ] Ensure 100% pass rate for state retrieval and update logic.

## 5. Update Documentation
- [ ] Update `@devs/vscode-webview` README or internal AOD (`.agent.md`) to document how to use the state persistence utility.

## 6. Automated Verification
- [ ] Execute a verification script that checks for the existence of the `WebviewStateManager` and validates its export signature.
