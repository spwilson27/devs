# Task: Validate CLI/Webview ANSI Rendering Consistency (Sub-Epic: 29_ANSI_Palette_Consistency)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-022]

## 1. Initial Test Written
- [ ] Create a script `scripts/verify_ansi_consistency.test.ts` that:
    - Generates a known "test strip" of ANSI color codes in the terminal (CLI mode).
    - Mocks a Webview environment and passes the same test strip to the `LogTerminal` component.
    - Captures the raw escape codes from the CLI and the mapped CSS variables from the Webview and asserts that they map back to the same semantic palette.
    - Fails the test if a color (e.g., `success`) is mapped to different ANSI codes or CSS variables in the two environments.

## 2. Task Implementation
- [ ] Create the verification script `scripts/verify_ansi_consistency.ts`.
- [ ] Implement a function `getAnsiCodesFromCli(palette)` that uses `chalk` or `ink` to generate a known color strip and extracts the raw escape codes from the buffer.
- [ ] Implement a function `getSemanticColorsFromWebview(palette)` that uses the `LogTerminal` component (via a JSDOM environment) to render the same palette and extracts the mapped CSS classes.
- [ ] Compare the outputs and generate a detailed report identifying any inconsistencies.
- [ ] Support both 16-color and 256-color modes in the validation script.

## 3. Code Review
- [ ] Ensure the script accounts for different terminal environments and handles cross-platform ANSI rendering (e.g., Terminal.app vs. iTerm2).
- [ ] Verify that the semantic palette is used as the single source of truth for all consistency checks.
- [ ] Check for accuracy in the 256-color fallback logic in both the CLI and Webview.

## 4. Run Automated Tests to Verify
- [ ] Run `vitest scripts/verify_ansi_consistency.test.ts` and ensure all tests pass.
- [ ] Execute the standalone script `pnpm ts-node scripts/verify_ansi_consistency.ts` and verify the consistency report shows 100% alignment.

## 5. Update Documentation
- [ ] Add a "Consistency Report" to `docs/ui_ux_design.md` detailing the validated mappings for all semantic roles.
- [ ] Update the Project DNA memory with the requirement that all new log components MUST pass the ANSI consistency check.

## 6. Automated Verification
- [ ] Run the `scripts/verify_ansi_consistency.ts` script as part of the CI pipeline for Phase 11 and verify that it returns a zero exit code if and only if all palette roles are consistently mapped.
