# Task: Implement Visual Palette Verification Utility (Sub-Epic: 05_TUI Core Semantic Palette)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-024-1], [7_UI_UX_DESIGN-REQ-UI-DES-024-2], [7_UI_UX_DESIGN-REQ-UI-DES-024-3], [7_UI_UX_DESIGN-REQ-UI-DES-024-4], [7_UI_UX_DESIGN-REQ-UI-DES-024-5]

## 1. Initial Test Written
- [ ] Write a smoke test in `packages/cli/src/tui/components/__tests__/PaletteTester.test.tsx` that renders the `PaletteTester` component and checks that it contains text labels for "Success", "Error", "Thinking", "Warning", and "Metadata".

## 2. Task Implementation
- [ ] Create `packages/cli/src/tui/components/PaletteTester.tsx`.
- [ ] The component should render a list of blocks, each representing a semantic color.
- [ ] For each color, display the name, the ANSI number, and a colored block using the `base` and `light` variants from the theme.
- [ ] Create a standalone script `packages/cli/scripts/check-palette.ts` that uses `ink` to render the `PaletteTester` component to the terminal.
- [ ] Add a `pnpm` script `tui:check-palette` to the `packages/cli/package.json` to easily run this utility.

## 3. Code Review
- [ ] Verify that the `PaletteTester` correctly consumes the `useTheme` hook.
- [ ] Ensure the visual layout is clear and readable even in smaller terminal windows.
- [ ] Check that the script correctly terminates the Ink instance after rendering.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/cli/src/tui/components/__tests__/PaletteTester.test.tsx`.
- [ ] Manually run `pnpm tui:check-palette` and verify the colors look correct in the terminal.

## 5. Update Documentation
- [ ] Add a screenshot or a description of the `PaletteTester` output to the `docs/ui_ux_design.md` to show the implemented semantic palette.

## 6. Automated Verification
- [ ] Use `run_shell_command` to execute the palette script and capture the output. Verify that the output contains the expected ANSI color sequences (using `grep` or a similar tool to find the escape codes).
