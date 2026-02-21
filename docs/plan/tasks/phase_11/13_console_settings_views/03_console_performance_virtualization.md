# Task: Console Performance & Scalability Guardrails (Sub-Epic: 13_Console_Settings_Views)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-058]

## 1. Initial Test Written
- [ ] Write a performance test for the `ConsoleView` with 1,000+ turns to verify that virtual scrolling via `react-window` is active (REQ-094, REQ-018).
- [ ] Write a test for the `postMessage` batching buffer in `@devs/core` to ensure updates are sent every 50ms (REQ-036).
- [ ] Write a test for the "Log Chunking" logic to ensure observations over 50KB are stored in discrete chunks and only the last 500 lines are rendered by default (REQ-047, REQ-097).

## 2. Task Implementation
- [ ] Implement virtual scrolling in the `ConsoleView` and `ThoughtStreamer` to maintain 60FPS with large reasoning traces (REQ-018, REQ-094).
- [ ] Implement the `postMessage` Batching Buffer to aggregate character-level updates into chunks every 50ms (REQ-036).
- [ ] Implement "Read More" logic for massive logs (REQ-097), fetching historical chunks from the Tier 2 project mirror or SQLite.
- [ ] Use selective reactivity (Zustand selectors) to minimize re-renders when the `active_turn_content` updates (REQ-045).
- [ ] Implement "Reasoning Log Windowing" (REQ-046) to evict historical traces from memory, re-fetching them only on-demand.

## 3. Code Review
- [ ] Verify that the `Shadow DOM` isolation prevents expensive style recalculations from affecting the rest of the VSCode workbench.
- [ ] Ensure that the memory usage of the Webview remains stable during prolonged streaming sessions.
- [ ] Confirm that the "Read More" button correctly fetches and appends historical data without losing current scroll position.

## 4. Run Automated Tests to Verify
- [ ] Run the performance suite and verify that frame rates stay above 50FPS during high-load simulations.
- [ ] Check for memory leaks using the `Node.js` or browser heap profiler in the development environment.

## 5. Update Documentation
- [ ] Document the virtualization and batching strategies in the Extension's performance guide.

## 6. Automated Verification
- [ ] Run a script that streams 10,000 log entries and verifies that the DOM element count for logs never exceeds a threshold (e.g., 600 nodes).
