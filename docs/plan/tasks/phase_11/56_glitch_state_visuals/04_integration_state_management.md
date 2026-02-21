# Task: Integrate Glitch Visual & Restore Feedback with State Store and Event Stream (Sub-Epic: 56_Glitch_State_Visuals)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-058-1], [7_UI_UX_DESIGN-REQ-UI-DES-058-2], [7_UI_UX_DESIGN-REQ-UI-DES-120]

## 1. Initial Test Written
- [ ] Write unit tests for the state slice and message handlers at tests/store/glitchSlice.test.ts that assert:
  - Dispatching a `STATE_REWIND` action (or receiving a `STATE_REWIND` postMessage) sets `isRewinding` true for the configured token duration and then resets it.
  - Dispatching a `STATE_RESTORED` action toggles a `lastRestoredAt` timestamp and emits a `showRestoreFeedback` flag for the UI to consume.

## 2. Task Implementation
- [ ] Add a small, isolated state slice to the UI store (e.g., src/store/glitchSlice.ts) with minimal API: {isRewinding:boolean, lastRestoredAt:number|null, showRestoreFeedback:boolean} and actions/selectors. If the project uses Zustand, add a `useGlitchStore` hook; if Redux, add a slice and thunk-friendly handlers.
- [ ] Implement a message handler in the Webview layer (src/webview/messageHandlers/glitch.ts) that listens for `STATE_REWIND` and `STATE_RESTORED` messages from the host or orchestrator and dispatches the appropriate store actions. Debounce or throttle events to meet the 60FPS message throttling guidance.
- [ ] Wire the GlitchRewind component and StateRestoreFeedback component to the store selectors. Ensure components subscribe to the smallest necessary slice to minimize re-renders.

## 3. Code Review
- [ ] Confirm the slice is small, pure, and easily testable with no side effects. Review message handler for proper batched updates and adherence to the project's postMessage batching guidelines.
- [ ] Ensure components use selector-level subscription to avoid full-app re-renders, and that event processing offloads heavy work to requestAnimationFrame or web worker if necessary.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for the slice and message handler. Run integration test that simulates a postMessage `STATE_REWIND` -> expect `isRewinding` true, and after token duration it resets; simulate `STATE_RESTORED` -> expect `showRestoreFeedback` true and the UI banner to appear.

## 5. Update Documentation
- [ ] Update docs/ui/glitch-visuals.md with the store API, message event shape examples, and recommended debouncing/ throttling parameters.

## 6. Automated Verification
- [ ] Add a script `scripts/verify-glitch-integration.sh` that runs the store unit tests and a headless integration that posts messages into the running webview harness and verifies DOM changes; script should exit non-zero on failures.
