# Task: Implement ANSI Color Mapping & Capability Detection (Sub-Epic: 07_TUI Fallbacks & Color Modes)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-063-1], [7_UI_UX_DESIGN-REQ-UI-DES-063-2], [7_UI_UX_DESIGN-REQ-UI-DES-063-3]

## 1. Initial Test Written
- [ ] Create a unit test in `packages/cli/src/tui/theme/__tests__/colorMapper.test.ts` that mocks `chalk.level` and verifies color output for different depths.
- [ ] Test `TrueColor` (level 3): Verify that `getSemanticColor('success')` returns the direct hex code `#4EC9B0` (from VSCode Dark+).
- [ ] Test `256-color` (level 2): Verify that the output is a valid xterm 256 color code.
- [ ] Test `16-color` (level 1): Verify that it falls back to basic ANSI constants (e.g., `chalk.green`).
- [ ] Test `No color` (level 0): Verify that it returns plain text.

## 2. Task Implementation
- [ ] Implement `ColorMapper` utility in `packages/cli/src/tui/theme/colorMapper.ts`.
- [ ] Use `supports-color` or `chalk.level` to detect terminal capability.
- [ ] Define a `Palette` interface and a mapping for:
    - `success`: `#4EC9B0`
    - `error`: `#F14C4C`
    - `thinking`: `#C586C0`
    - `warning`: `#CCA700`
    - `metadata`: `#808080`
- [ ] Implement mapping logic for each `chalk.level`:
    - Level 3: `chalk.hex(color)`
    - Level 2: Ansi256 mapping (can use `color-convert` or similar if needed, or a manual map).
    - Level 1: Basic ANSI color mapping.
- [ ] Export a `useTheme` hook or similar for Ink components to consume these colors.

## 3. Code Review
- [ ] Verify that no hardcoded hex codes are used outside the `ColorMapper`.
- [ ] Ensure that the mapping to 16-color mode uses high-contrast variants where appropriate.
- [ ] Check that the theme detects background brightness (light vs dark terminal) if possible to adjust metadata/thinking colors for legibility.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/theme/__tests__/colorMapper.test.ts` and ensure all suites pass.

## 5. Update Documentation
- [ ] Update `packages/cli/README.md` to include a section on terminal color support and how to force specific modes via `FORCE_COLOR`.

## 6. Automated Verification
- [ ] Execute a script that cycles through `FORCE_COLOR=1`, `FORCE_COLOR=2`, `FORCE_COLOR=3` and captures the ANSI output to verify the color depth shifts.
