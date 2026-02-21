# Task: Implement TUI Header (System Health Zone) (Sub-Epic: 08_TUI Layout & Main Zones)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-061-1]

## 1. Initial Test Written
- [ ] Create `packages/cli/src/tui/components/Header.test.tsx`.
- [ ] Write tests to verify the `Header` component displays the project name and system health indicators (CPU, Memory).
- [ ] Mock the system health telemetry source to provide deterministic values for the test.
- [ ] Verify that the header uses the correct semantic color (e.g., Magenta for "Thinking" state or Green for "Healthy").

## 2. Task Implementation
- [ ] Implement `Header.tsx` in `packages/cli/src/tui/components/`.
- [ ] Create a `SystemHealth` sub-component that polls (or subscribes to) CPU and Memory usage.
- [ ] Use `StatusBadge` primitive (if available) or standard Ink `<Text>` with backgrounds to display health metrics.
- [ ] Ensure the Header occupies the full width of the terminal and has a `double` border bottom to distinguish it from the content areas.
- [ ] Implement a "Compact Mode" toggle for the header where it only shows the `[Current Task ID]` if the width is narrow.

## 3. Code Review
- [ ] Verify the polling interval for system health is not too aggressive (e.g., every 2-5 seconds).
- [ ] Ensure that system health calls are non-blocking and do not lag the TUI thread.
- [ ] Check that the component follows the "Minimalist Authority" philosophy.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/components/Header.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the TUI component library documentation to include the `Header` component properties and behavior.

## 6. Automated Verification
- [ ] Run the TUI in a mock environment and verify the `Header` output contains the expected "CPU" and "MEM" strings.
