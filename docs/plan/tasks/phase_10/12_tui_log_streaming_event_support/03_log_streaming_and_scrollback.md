# Task: Implement Real-time Log Streaming and Scrollback Buffer (Sub-Epic: 12_TUI Log Streaming & Event Support)

## Covered Requirements
- [9_ROADMAP-REQ-INT-003], [7_UI_UX_DESIGN-REQ-UI-DES-068-2]

## 1. Initial Test Written
- [ ] Write an integration test where `LogTerminal` is hooked to the `TUIEventBus`.
- [ ] Push 1100 log events through the bus.
- [ ] Verify that the `LogTerminal` state contains exactly 1000 logs (the first 100 should have been pruned).
- [ ] Verify that the TUI doesn't lag significantly when events are fired at high frequency (60FPS target).

## 2. Task Implementation
- [ ] In `LogTerminal`, implement a state-managed buffer (using a `useReducer` or a custom hook) to store incoming log lines.
- [ ] Implement the pruning logic to enforce the 1000-line scrollback limit (`7_UI_UX_DESIGN-REQ-UI-DES-068-2`).
- [ ] Use Ink's `Static` component for the historical log lines to minimize the number of components React has to reconcile during updates.
- [ ] Implement a "viewport" logic if the terminal height is smaller than the buffer, ensuring the latest logs are always visible.
- [ ] Add a visual indicator (e.g., `--- ↑ More logs above ---`) when the buffer is full and scrolling is active.

## 3. Code Review
- [ ] Ensure that `Static` is used correctly to prevent the entire log history from re-rendering on every new log event.
- [ ] Verify that the circular buffer implementation is memory-efficient and doesn't cause garbage collection spikes.

## 4. Run Automated Tests to Verify
- [ ] Run performance benchmarks if possible, or manually verify 60FPS-like smoothness during high-frequency log bursts.

## 5. Update Documentation
- [ ] Document the scrollback limit and performance optimizations in the CLI developer guide.

## 6. Automated Verification
- [ ] Run a stress test script that sends 5000 logs in 5 seconds and verify that the process memory usage stays within acceptable bounds and the final buffer size is 1000.
