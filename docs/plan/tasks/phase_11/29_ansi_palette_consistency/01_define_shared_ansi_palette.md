# Task: Define Shared ANSI Semantic Palette (Sub-Epic: 29_ANSI_Palette_Consistency)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-019], [7_UI_UX_DESIGN-REQ-UI-DES-023]

## 1. Initial Test Written
- [ ] Create a unit test in `packages/ui-hooks/src/theme/__tests__/ansiPalette.test.ts` that:
    - Verifies the `ansiPalette` constant contains mappings for all semantic roles: `success`, `error`, `thinking`, `warning`, and `metadata`.
    - Asserts that each role maps to the correct standard ANSI escape codes as defined in the design spec (e.g., `success` maps to `\x1b[32m` for 16-color and `\x1b[38;5;10m` for 256-color).
    - Verifies that a `getAnsiColor(role, mode)` utility function returns the correct code for '16color', '256color', and 'truecolor' modes.

## 2. Task Implementation
- [ ] Create the file `packages/ui-hooks/src/theme/ansiPalette.ts`.
- [ ] Define and export a `SemanticAnsiPalette` interface.
- [ ] Implement and export the `ansiPalette` constant using the following mappings:
    - `success`: ANSI 2 / ANSI 10
    - `error`: ANSI 1 / ANSI 9
    - `thinking`: ANSI 5 / ANSI 13
    - `warning`: ANSI 3 / ANSI 11
    - `metadata`: ANSI 8
- [ ] Implement a `getAnsiColor` helper function that selects the appropriate code based on the terminal's color support level.
- [ ] Export a mapping of these ANSI codes to VSCode theme variables (e.g., `--vscode-debugToken-string`) to ensure the Webview can match the editor's visual style while respecting the ANSI intent.

## 3. Code Review
- [ ] Verify that the palette uses standard ANSI escape sequences (CSI codes).
- [ ] Ensure the mapping is consistent with the design specification in `specs/7_ui_ux_design.md`.
- [ ] Check that the constants are easily importable by both `packages/cli` and `packages/vscode`.

## 4. Run Automated Tests to Verify
- [ ] Run `vitest packages/ui-hooks/src/theme/__tests__/ansiPalette.test.ts` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the internal `packages/ui-hooks/README.md` to document the availability of the shared ANSI palette.
- [ ] Ensure the AOD (`.agent.md`) for the theme module reflects the semantic color mapping.

## 6. Automated Verification
- [ ] Run a script `scripts/check_palette_consistency.ts` that imports the palette and prints a color strip to the terminal, then grep the output for the raw escape codes to confirm they match the intended values.
