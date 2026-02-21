# Task: Implement invalid context detection and DASHBOARD fallback recovery (Sub-Epic: 45_Performance_Reactivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-068]

## 1. Initial Test Written
- [ ] Create integration tests at tests/integration/recovery.test.tsx that simulate invalid contexts and assert the webview recovers to DASHBOARD view:
  - Test case A: missing required project metadata on load -> app transitions to DASHBOARD and shows a non-blocking banner "Context invalid — returned to Dashboard".
  - Test case B: sequence_id mismatch between extension and webview -> triggers recovery flow, offers "Reconnect" button and logs the reason to telemetry.
  - Use mocked store and router to assert ViewRouter navigates to DASHBOARD and Retry logic attempts to re-sync once.

## 2. Task Implementation
- [ ] Implement context validation and recovery at src/webview/utils/contextValidator.ts and src/webview/system/recoveryManager.ts:
  - contextValidator.validate(state) should perform checks: required fields present, sequence_id in acceptable range, timestamp freshness, and minimal integrity checks.
  - recoveryManager.shouldFallback(error) computes if fallback to DASHBOARD is required and performs safeRollback of transient state.
  - Integrate recoveryManager into ViewRouter so that when invalid context detected, ViewRouter performs a non-destructive transition to DASHBOARD and retains user preferences.
  - Provide a visible banner/action panel in the DASHBOARD offering: "Reconnect", "Open Logs", and "Report Issue". "Reconnect" triggers a controlled resync with exponential backoff.
  - Ensure the flow avoids infinite redirect loops by storing a short-lived retry token and using exponential backoff with jitter.

## 3. Code Review
- [ ] Verify detection rules are conservative and well-documented; avoid false positives that could degrade UX.
- [ ] Ensure user-facing messages are concise and localized-ready; ensure no sensitive data is included in logs.
- [ ] Confirm the recovery path is idempotent and that state rollbacks are safe (do not drop persistent user data unintentionally).

## 4. Run Automated Tests to Verify
- [ ] Run: npm run test -- tests/integration/recovery.test.tsx. Additionally run a headless scenario script that simulates sequence desync and validates the retry/backoff behavior.

## 5. Update Documentation
- [ ] Update docs/webview/recovery.md describing the validation rules, banner copy, UX flows, and recommended telemetry fields for diagnosing recovery events.

## 6. Automated Verification
- [ ] Add scripts/simulate-desync.js to automatically reproduce desync scenarios and assert that the app transitions to DASHBOARD, that retry attempts occur with exponential backoff, and that a maximum retry cap prevents infinite loops.