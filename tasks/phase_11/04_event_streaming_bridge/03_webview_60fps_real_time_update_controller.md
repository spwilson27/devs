# Task: Webview: 60FPS Real-Time Update Controller (Sub-Epic: 04_Event_Streaming_Bridge)

## Covered Requirements
- [9_ROADMAP-REQ-036]

## 1. Initial Test Written
- [ ] Create a performance benchmark test in the VSCode Webview (e.g., using `Playwright` or a dedicated Vite/React bench tool).
- [ ] Simulate 1,000 log messages arriving in 100ms (10,000 logs/sec).
- [ ] Measure the time between frames (frame delta) and verify that it remains consistently < 16.7ms (60FPS).
- [ ] Verify that the `ThoughtStream` component does not re-render the entire list for every small update.
- [ ] Create a test for the `MessageBatcher` consumer in the Webview that verifies it correctly receives and processes batched message objects.

## 2. Task Implementation
- [ ] Implement a `MessageStreamController` hook in `@devs/vscode/webview/src/hooks/useMessageStream.ts`.
- [ ] This hook should consume messages from the VSCode `onMessage` event and apply them to the React/Zustand state.
- [ ] Use `React.useTransition` or `React.useDeferredValue` (React 18+) to prioritize UI responsiveness over log rendering.
- [ ] Implement incremental rendering logic in the `ThoughtStream` component: only append new chunks rather than re-rendering the whole Markdown block.
- [ ] If log frequency exceeds a threshold (e.g., > 100 lines/sec), implement an additional UI-side debouncer that updates the view at a fixed 60FPS rate using `requestAnimationFrame`.
- [ ] Ensure that even under heavy log load, high-priority UI elements (buttons, navigation) remain interactive.

## 3. Code Review
- [ ] Confirm that the implementation avoids unnecessary re-renders in the React component tree (using `memo` and selective selectors).
- [ ] Verify that the Webview does not freeze or become sluggish during high-activity periods (e.g., agent generating long code blocks).
- [ ] Check that memory usage remains stable even with a long stream of logs (using virtualization or log chunking).
- [ ] Ensure that the 60FPS target is maintained on various hardware profiles.

## 4. Run Automated Tests to Verify
- [ ] Run the performance benchmark and save the results (FPS, CPU usage).
- [ ] Run manual validation by triggering a long "thought" stream and observing the UI smoothness in the VSCode Extension Host.

## 5. Update Documentation
- [ ] Update the `UI/UX Architecture` document to include the "60FPS Rule" for real-time updates.
- [ ] Document the use of React 18 concurrent features for handling high-frequency streaming.

## 6. Automated Verification
- [ ] Use a performance script that captures the Chrome/Webview "Frame Time" metric during a simulated high-activity period; verify that the 95th percentile is below 17ms.
