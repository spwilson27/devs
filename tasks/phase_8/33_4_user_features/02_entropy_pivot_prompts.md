# Task: Implement Entropy Pivot Rationalization Notification (Sub-Epic: 33_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-064]

## 1. Initial Test Written
- [ ] Write tests in `src/tests/engine/pivot.test.ts` to verify that when the `StrategyPivotAgent` forces a change, a `PivotRationalizationEvent` is dispatched.
- [ ] Write UI/CLI handler tests to confirm the event is correctly formatted into a user-facing notification.

## 2. Task Implementation
- [ ] Define the `PivotRationalizationEvent` interface in `src/events/types.ts` containing the reason for the pivot and the new strategy.
- [ ] Modify the `StrategyPivotAgent` or entropy detector to emit this event whenever a strategy change is forced due to a detected loop.
- [ ] Implement a listener in the UI/CLI presentation layer (e.g., `src/cli/notifications.ts` or `src/extension/notifications.ts`) to display the "Pivot Rationalization" message to the user.

## 3. Code Review
- [ ] Ensure the rationalization message is clearly distinguishable from standard agent debug logs.
- [ ] Verify that the event emission does not accidentally block the agent's core execution loop.

## 4. Run Automated Tests to Verify
- [ ] Run the test suite (e.g., `npm run test -- src/tests/engine/pivot.test.ts`) to verify event emission and notification formatting.

## 5. Update Documentation
- [ ] Document the new `PivotRationalizationEvent` structure in `docs/architecture/events.md`.

## 6. Automated Verification
- [ ] Execute an E2E test script that simulates a 3-failure loop to trigger the pivot agent, verifying that the CLI/UI mock output stream receives the exact "Pivot Rationalization" string.
