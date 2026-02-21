# Task: Implement LogTerminal ANSI Parser and Theme Mapping (Sub-Epic: 29_ANSI_Palette_Consistency)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-020], [7_UI_UX_DESIGN-REQ-UI-DES-021]

## 1. Initial Test Written
- [ ] Create a unit test for the `LogTerminal` component in `packages/vscode/src/webview/components/__tests__/LogTerminal.test.tsx` that:
    - Asserts that a string containing `\x1b[32mSuccess\x1b[0m` renders as a `<span>` element with the correct CSS class for `success` in the Webview.
    - Verifies that multiple ANSI escape sequences in a single string are correctly parsed and rendered as separate themed spans.
    - Confirms that the parser handles both 16-color and 256-color ANSI codes by falling back to the nearest semantic color.

## 2. Task Implementation
- [ ] Create or update `packages/vscode/src/webview/components/LogTerminal.tsx`.
- [ ] Integrate a robust ANSI-to-HTML or ANSI-to-React parser (e.g., `ansi-to-react` or similar) that allows for custom theme mapping.
- [ ] Implement a mapping function that converts incoming ANSI codes to the semantic palette defined in `@devs/ui-hooks`.
- [ ] Use CSS variables (e.g., `var(--vscode-terminal-ansiGreen)`) to ensure the colors adapt to the active VSCode theme while maintaining the semantic intent of the log message.
- [ ] Apply `React.memo` and partial updates to the `LogTerminal` to handle high-frequency character streaming without overall UI degradation.

## 3. Code Review
- [ ] Verify the parser implementation handles standard ANSI escape usage (CSI codes) as per `7_UI_UX_DESIGN-REQ-UI-DES-021`.
- [ ] Ensure the mapping logic uses the shared palette constants from `@devs/ui-hooks` to guarantee CLI/Webview consistency.
- [ ] Check for memory leaks or performance bottlenecks in the parsing logic for large log streams.

## 4. Run Automated Tests to Verify
- [ ] Run `vitest packages/vscode/src/webview/components/__tests__/LogTerminal.test.tsx` and ensure all assertions pass.
- [ ] Verify that character-level updates (streaming) are correctly handled by the parser without state corruption.

## 5. Update Documentation
- [ ] Add a section to `docs/ui_ux_architecture.md` explaining how ANSI logs are rendered in the VSCode Extension.
- [ ] Document the custom theme mapping for ANSI colors in the `.agent.md` file for the VSCode module.

## 6. Automated Verification
- [ ] Create a mock webview renderer script `scripts/verify_webview_ansi.ts` that passes a known ANSI test string to the `LogTerminal` component and validates the generated HTML structure for the expected semantic classes.
