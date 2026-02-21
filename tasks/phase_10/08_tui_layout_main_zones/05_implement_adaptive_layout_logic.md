# Task: Implement Adaptive Layout Logic (Compact Mode) (Sub-Epic: 08_TUI Layout & Main Zones)

## Covered Requirements
- [9_ROADMAP-REQ-UI-003], [7_UI_UX_DESIGN-REQ-UI-DES-061]

## 1. Initial Test Written
- [ ] Create `packages/cli/src/tui/hooks/useAdaptiveLayout.test.tsx`.
- [ ] Test that the `useAdaptiveLayout` hook returns `isCompact: true` when the mocked `stdout.columns` is less than 80.
- [ ] Test that the `useAdaptiveLayout` hook returns `isCompact: false` when the mocked `stdout.columns` is 80 or more.
- [ ] Create a test for `MainLayout.test.tsx` that verifies the Sidebar is NOT rendered when `isCompact` is true.

## 2. Task Implementation
- [ ] Implement a `useAdaptiveLayout` hook in `packages/cli/src/tui/hooks/` using Ink's `useStdout`.
- [ ] Integrate this hook into the `MainLayout` component.
- [ ] Update `MainLayout.tsx` to conditionally render the `Sidebar`.
- [ ] If `isCompact` is true, switch the layout to a single vertical stack (Header + Main) and hide the Sidebar.
- [ ] When in Compact Mode, ensure the Header displays the `[Current Task ID]` to maintain context (breadcrumb navigation).

## 3. Code Review
- [ ] Verify that the TUI doesn't crash or exhibit "flicker" during rapid terminal resizing.
- [ ] Ensure that the `useAdaptiveLayout` hook correctly listens to `resize` events if Ink's `useStdout` doesn't automatically handle it.
- [ ] Check for proper layout transitions and spacing in both modes.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/hooks/useAdaptiveLayout.test.tsx` and ensure all tests pass.
- [ ] Run `npm test packages/cli/src/tui/components/MainLayout.test.tsx` to verify responsive behavior.

## 5. Update Documentation
- [ ] Update the TUI architecture documentation to explain the adaptive layout strategy and the 80-character threshold.

## 6. Automated Verification
- [ ] Run the TUI and use a script to simulate a narrow terminal window; verify the Sidebar disappears and the layout remains usable.
