# Task: Periodic Critical UI State Persistence (Sub-Epic: 08_Persistence_Recovery)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-051]

## 1. Initial Test Written
- [ ] Create a unit test for a `usePersistenceHeartbeat` hook.
- [ ] Use `vi.useFakeTimers()` to simulate the passage of time.
- [ ] Verify that `WebviewStateManager.saveState` is NOT called before 5 seconds.
- [ ] Verify that `WebviewStateManager.saveState` IS called after 5 seconds with the current critical state.
- [ ] Verify that the timer resets and triggers again after another 5 seconds.

## 2. Task Implementation
- [ ] Create a React hook `usePersistenceHeartbeat` in `@devs/ui-hooks`.
- [ ] Identify "Critical UI State" fields: `activeFilters`, `searchQuery`, `sidebarCollapsed`, `activeDocumentId`.
- [ ] Implement an effect with a 5-second `setInterval` that captures these fields from the global Zustand store.
- [ ] Call `WebviewStateManager.saveState` within the interval.
- [ ] Ensure the interval is cleared on component unmount to prevent memory leaks and unnecessary background activity.
- [ ] Add a "dirty" check to avoid calling `saveState` if the critical state hasn't changed since the last snapshot.

## 3. Code Review
- [ ] Ensure the 5-second interval is strictly followed as per requirement [6_UI_UX_ARCH-REQ-051].
- [ ] Verify that the state being persisted is truly "critical" and doesn't include overly large blobs that could hit VSCode's state limits (usually ~1MB-5MB).
- [ ] Check that the heartbeat doesn't cause performance degradation by triggering expensive store selectors too frequently.

## 4. Run Automated Tests to Verify
- [ ] Run the `usePersistenceHeartbeat` tests.
- [ ] Verify that the heartbeat correctly identifies state changes.

## 5. Update Documentation
- [ ] Add a note in the technical spec about the "Heartbeat Persistence" mechanism for crash recovery.

## 6. Automated Verification
- [ ] Use a test script to monitor `postMessage` calls from the Webview and verify that a state update message is emitted approximately every 5 seconds when state is "dirty".
