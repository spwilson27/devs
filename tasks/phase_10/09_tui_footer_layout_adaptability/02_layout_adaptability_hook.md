# Task: TUI Layout Adaptability Hook (Sub-Epic: 09_TUI Footer & Layout Adaptability)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-062-1]

## 1. Initial Test Written
- [ ] Create a test for a `useTerminalDimensions` hook in `packages/cli/src/tui/hooks/__tests__/useTerminalDimensions.test.tsx`.
- [ ] Mock `process.stdout.columns` and `process.stdout.on('resize', ...)` to simulate terminal resizing.
- [ ] Verify that the hook returns the correct `width` and `height`.
- [ ] Create a test for a `useLayoutMode` hook (or a Zustand selector) that returns `isCompact: true` when width is less than 80 characters, and `false` otherwise.

## 2. Task Implementation
- [ ] Implement the `useTerminalDimensions` hook in `packages/cli/src/tui/hooks/useTerminalDimensions.ts`.
- [ ] Add a listener for the `resize` event on `process.stdout` to update the dimensions in real-time.
- [ ] Implement the responsive logic to determine the `layoutMode` (STANDARD vs COMPACT).
- [ ] Integrate this state into the global TUI store (Zustand) in `packages/cli/src/tui/store/useTuiStore.ts` so all components can react to layout changes.
- [ ] Ensure the hook cleans up its event listeners on unmount.

## 3. Code Review
- [ ] Verify that the resizing logic is debounced if necessary to prevent excessive re-renders during active window dragging.
- [ ] Ensure that the threshold (80 characters) is defined as a constant.
- [ ] Check that the hook handles environments where `process.stdout` might not be a TTY or have dimensions (e.g., in CI or pipe mode).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/hooks/__tests__/useTerminalDimensions.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the TUI architecture documentation to describe how responsive layouting is handled.
- [ ] Document the 80-character threshold for "Compact Mode".

## 6. Automated Verification
- [ ] Run a CLI verification script that mocks different `process.stdout.columns` values and asserts that the TUI store reflects the correct `isCompact` state.
