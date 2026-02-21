# Task: Implement Webview Desync Detection and State Refresh (Sub-Epic: 07_State_Watchers_Sync)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-050], [6_UI_UX_ARCH-REQ-038]

## 1. Initial Test Written
- [ ] Create a unit test for the Zustand store's `handleStateUpdate` reducer logic.
- [ ] Test that an incoming `sequence_id` higher than the current state's `sequence_id` results in a state update.
- [ ] Test that an incoming `sequence_id` lower than the current state's `sequence_id` (a stale update) triggers a warning or a "Hard Refresh" request.
- [ ] Mock the MCP client and test that a `STATE_MODIFIED` message from the extension host triggers a full state refresh (`refresh_project_state`).

## 2. Task Implementation
- [ ] In the `@devs/vscode` webview React app, update the global Zustand store to include a `lastSequenceId` (number) in the project state.
- [ ] In the `ProjectProvider` or equivalent component, add a `window.addEventListener('message', ...)` to listen for the `STATE_MODIFIED` message from the extension host.
- [ ] Upon receiving the `STATE_MODIFIED` message, trigger a call to the `refresh_project_state` MCP tool to pull the latest state from the database.
- [ ] Implement a comparison logic for every state update (incremental or full) that checks the `sequence_id` of the incoming data against the store's `lastSequenceId`.
- [ ] If the incoming `sequence_id` is out of order or stale, trigger a `hardRefresh()` that fetches the entire state and resets the store.
- [ ] Add a visual "Out of Sync" indicator or a temporary desaturation filter as per the architectural design when a desync is detected.

## 3. Code Review
- [ ] Ensure that the state refresh logic doesn't result in infinite loops where a refresh triggers another refresh.
- [ ] Check for appropriate handling of `sequence_id` mismatches (e.g., if the DB is reset, handled by `incoming < current`).
- [ ] Verify that optimistic UI updates (if any) are correctly integrated with the `sequence_id` checks.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` or Vitest for the webview components and store logic to ensure the sync and refresh tests pass.

## 5. Update Documentation
- [ ] Update the UI architecture documentation to include the state synchronization and desync detection protocol.
- [ ] Document the "Hard Refresh" mechanism and when it is triggered.

## 6. Automated Verification
- [ ] Use a test script to send a sequence of state updates to the webview via `postMessage` and verify that the UI correctly handles out-of-order updates.
- [ ] Use the VSCode webview debugger to observe the state transitions and sequence checks during a project run.
