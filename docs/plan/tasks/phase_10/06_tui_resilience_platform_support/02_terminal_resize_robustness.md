# Task: Terminal Resizing Robustness and Layout Recalculation (Sub-Epic: 06_TUI Resilience & Platform Support)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-RISK-005]

## 1. Initial Test Written
- [ ] Create an integration test for the TUI entry point that mocks `process.stdout.columns` and `process.stdout.rows`.
- [ ] Simulate a 'resize' event on `process.stdout`.
- [ ] Verify that the TUI state (specifically the dimensions in the global store or context) updates correctly.
- [ ] Write a test to ensure that a "clear terminal" command (or equivalent Ink clear) is triggered upon significant resize to prevent buffer corruption.

## 2. Task Implementation
- [ ] Implement a `useTerminalSize` hook in `@devs/cli/tui/hooks/useTerminalSize.ts` that subscribes to `process.stdout.on('resize')`.
- [ ] Implement a `ResizeObserver` component in `@devs/cli/tui/components/ResizeObserver.tsx` that wraps the entire Ink application.
- [ ] This component should:
    - Capture the current dimensions.
    - Trigger a re-render of the layout.
    - If the terminal size drops below a certain threshold (e.g., 80 columns), switch to a "Compact Mode" layout.
    - Manually invoke `process.stdout.write('\u001bc')` or `console.clear()` if artifacts are detected during development, or use Ink's internal mechanisms to ensure a clean redraw.
- [ ] Integrate the resizing logic with the `Zustand` store if layout state needs to be shared across components.

## 3. Code Review
- [ ] Verify that the 'resize' event listener is properly cleaned up on unmount to prevent memory leaks.
- [ ] Ensure that the layout recalculation is efficient and doesn't cause infinite render loops.
- [ ] Check that the "Compact Mode" transitions are smooth and don't lose essential telemetry data.

## 4. Run Automated Tests to Verify
- [ ] Run the TUI resizing integration tests.
- [ ] Verify that the TUI survives simulated rapid resizing without crashing.

## 5. Update Documentation
- [ ] Document the terminal resizing strategy in the TUI architecture section of the docs.

## 6. Automated Verification
- [ ] Run a stress test script that repeatedly resizes the virtual terminal and checks for process exit codes or error logs in the `agent_logs` table.
