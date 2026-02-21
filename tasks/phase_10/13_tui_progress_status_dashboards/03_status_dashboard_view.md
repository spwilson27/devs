# Task: Implement TUI Status Dashboard View (Sub-Epic: 13_TUI Progress & Status Dashboards)

## Covered Requirements
- [9_ROADMAP-REQ-UI-002]

## 1. Initial Test Written
- [ ] Create unit tests for the `StatusDashboard` component in `@devs/cli/src/tui/views/__tests__/StatusDashboard.test.tsx`.
- [ ] Mock the global state store (Zustand) to simulate a project in various phases (Research, Design, Implementation).
- [ ] Verify that the `StatusDashboard` correctly integrates the `TUIHeader` and `ProgressBar` / `StepProgress` components.
- [ ] Ensure the dashboard correctly renders the current Epic's progress and the active task's status.
- [ ] Verify the layout zones (Header, Sidebar, Main, Footer) are correctly positioned using Flexbox.

## 2. Task Implementation
- [ ] Implement the `StatusDashboard` component in `@devs/cli/src/tui/views/StatusDashboard.tsx`.
- [ ] Use `React Ink`'s `<Box>` component to define the 4 primary layout zones:
    - Top Zone: `TUIHeader` component (System Health).
    - Left Zone (Sidebar): Epic list with current Epic progress (use `StepProgress`).
    - Center Zone (Main): Active task implementation details and console (if applicable).
    - Bottom Zone (Footer): Command shortcuts (e.g., "P for Pause").
- [ ] Ensure the dashboard accurately reflects the current state from the global store:
    - Total Epic progress (Percentage).
    - Current Task name and ID.
    - Agent "Thought" vs "Action" status.
- [ ] Implement a polling mechanism for state updates to ensure the dashboard reflects changes in real-time.

## 3. Code Review
- [ ] Ensure the dashboard respects terminal resizing and does not crash on terminals with very small dimensions (implement "Compact Mode" logic).
- [ ] Verify that the layout correctly uses Unicode box-drawing characters for borders (double-line for focus).
- [ ] Check that keyboard-first navigation shortcuts are correctly displayed in the Footer zone.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test @devs/cli/src/tui/views/__tests__/StatusDashboard.test.tsx` and ensure all tests pass.
- [ ] Execute `devs status` in the CLI to visually verify the dashboard's layout in the terminal.

## 5. Update Documentation
- [ ] Update the `devs` CLI manual or project documentation to include a screenshot or ASCII art representation of the Status Dashboard.
- [ ] Document the primary zones of the TUI and what information each zone displays.

## 6. Automated Verification
- [ ] Create a script `scripts/verify_status_dashboard_tui.ts` that mocks a project with 3 Epics and 5 Tasks, renders the `StatusDashboard`, and captures the output to verify that the active Epic is correctly highlighted.
