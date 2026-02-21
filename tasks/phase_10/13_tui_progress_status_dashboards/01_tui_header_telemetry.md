# Task: Implement TUI Header with System Health Telemetry (Sub-Epic: 13_TUI Progress & Status Dashboards)

## Covered Requirements
- [9_ROADMAP-REQ-SYS-002]

## 1. Initial Test Written
- [ ] Create unit tests for the `TUIHeader` component in `@devs/cli/src/tui/components/__tests__/TUIHeader.test.tsx`.
- [ ] Mock the system metrics provider to simulate various health states (e.g., high CPU, low RAM, API offline).
- [ ] Verify that the component correctly renders CPU usage (percentage), Memory usage (RSS/Total), and Gemini API status.
- [ ] Test the "Compact Mode" logic (under 80 characters) to ensure metrics are truncated or reformatted appropriately.

## 2. Task Implementation
- [ ] Implement the `TUIHeader` component using `React Ink` in `@devs/cli/src/tui/components/TUIHeader.tsx`.
- [ ] Integrate with the `@devs/cli` state store (Zustand) to retrieve real-time system metrics.
- [ ] Use `chalk` for color-coding metrics:
    - Success (Green): API Online, Low CPU/RAM usage.
    - Warning (Yellow): Moderate resource usage.
    - Error (Red): API Offline, High CPU/RAM (>90%).
- [ ] Ensure the layout uses a single line or a fixed-height block as per the "Zone: Header" layout specification.
- [ ] Implement a polling or event-driven update mechanism to refresh telemetry every 2 seconds.

## 3. Code Review
- [ ] Verify the component is "Transparent by Design" and does not hide errors during metric fetching.
- [ ] Ensure the UI is platform-agnostic and uses ANSI fallbacks for non-TrueColor terminals.
- [ ] Check that the component doesn't cause excessive re-renders of the entire TUI (use `Static` or `memo` where appropriate).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test @devs/cli/src/tui/components/__tests__/TUIHeader.test.tsx` and ensure all tests pass.
- [ ] Run the TUI in a simulated terminal environment to visually verify the layout.

## 5. Update Documentation
- [ ] Update the `@devs/cli` README or TUI documentation to include the new `TUIHeader` component details and health telemetry features.
- [ ] Document the fallback behavior for terminals with limited color support.

## 6. Automated Verification
- [ ] Create a script `scripts/verify_tui_header.ts` that spawns the TUI, captures the first 100 characters of the output, and validates the presence of health telemetry patterns (e.g., "CPU:", "MEM:", "API:").
