# Task: Update ThoughtStreamer for incremental streaming without full re-renders (Sub-Epic: 46_Memoization_Lazy_Loading)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-068]

## 1. Initial Test Written
- [ ] Write unit tests packages/webview/src/components/__tests__/ThoughtStreamer.test.tsx that validate incremental append behavior and that ThoughtStreamer does NOT re-render on each incoming character.
  - Simulate a stream of partial thought chunks; assert that ThoughtStreamer only updates when a chunk boundary or semantic flush occurs.
  - Verify virtual scrolling behavior by simulating >50 turns and ensuring virtualized list renders only visible window.

## 2. Task Implementation
- [ ] Modify ThoughtStreamer implementation (packages/webview/src/components/ThoughtStreamer/ThoughtStreamer.tsx):
  - Keep a small ephemeral buffer for the "in-progress" thought that is updated frequently but rendered into a lightweight separate DOM node whose updates are isolated from the historical list.
  - Historical entries must be kept in an immutable array and appended only when a chunk completes; use state updater pattern setHistory(h => [...h, newEntry]) to avoid mutating references used by selectors.
  - Use the useMemoizedSelector hook for subscribing to the parts of the store ThoughtStreamer needs (e.g., history metadata) so small meta updates do not trigger full re-renders.
  - Use a virtualization library (e.g., react-window) for rendering history >50 turns to maintain performance.

## 3. Code Review
- [ ] Ensure ThoughtStreamer separates "in-progress" ephemeral UI from the historical DOM nodes.
- [ ] Verify selective reactivity: the component should only subscribe to minimal state and not the entire stream buffer.
- [ ] Confirm that react-markdown rendering is invoked only for fully committed entries (not for in-progress partial text every char).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for ThoughtStreamer and end-to-end integration tests that exercise streaming: pnpm test --filter packages/webview and confirm passing.

## 5. Update Documentation
- [ ] Update packages/webview/docs/ThoughtStreamer.md describing incremental rendering, virtualization thresholds, and guidance for writing other components that consume streaming data.

## 6. Automated Verification
- [ ] Include the ThoughtStreamer unit tests in CI and add a small perf smoke test that runs a high-frequency stream and asserts total render count for ThoughtStreamer stays below a configurable threshold (e.g., < 5 renders per second of streaming).