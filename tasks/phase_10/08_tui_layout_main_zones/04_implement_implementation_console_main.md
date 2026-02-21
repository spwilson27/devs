# Task: Implement TUI Main Console (Implementation Zone) (Sub-Epic: 08_TUI Layout & Main Zones)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-061-3]

## 1. Initial Test Written
- [ ] Create `packages/cli/src/tui/components/MainConsole.test.tsx`.
- [ ] Test that the `MainConsole` component renders logs provided via a mock `LogStore`.
- [ ] Verify that the `MainConsole` component can correctly display "Thinking Blocks" with different background colors.
- [ ] Verify that the `MainConsole` handles scrollback by capping the number of lines displayed.

## 2. Task Implementation
- [ ] Implement `MainConsole.tsx` in `packages/cli/src/tui/components/`.
- [ ] Create a container using Ink's `<Box>` that fills the remaining layout area (`flexGrow: 1`).
- [ ] Subscribe to the `LogStore` to receive and display real-time agent telemetry.
- [ ] Use `LogTerminal` primitive (if available) or a standard `<Box>` with `overflow="scroll"` to render the logs.
- [ ] Ensure the Main Console has a `double-line` border when it is the focused zone.
- [ ] Implement support for ANSI formatting (colors, bold) within the console using `chalk` or Ink's `<Text color="...">`.

## 3. Code Review
- [ ] Verify that the log streaming implementation does not cause memory leaks with large logs.
- [ ] Ensure that the component performs well during high-frequency log updates by using `Static` if necessary.
- [ ] Check for proper secret redaction in the UI stream before rendering.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/components/MainConsole.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the `MainConsole` specification and its log rendering capabilities in the project documentation.

## 6. Automated Verification
- [ ] Run the TUI and verify that the `MainConsole` output correctly renders agent "Thoughts" and "Actions" with the appropriate semantic colors.
