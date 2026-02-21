# Task: Implement TUI Theme and ANSI Palette (Sub-Epic: 04_TUI Framework & Styling Foundations)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-024], [6_UI_UX_ARCH-REQ-072], [7_UI_UX_DESIGN-REQ-UI-DES-060]

## 1. Initial Test Written
- [ ] Create a unit test for a `TUIThemeProvider` component.
- [ ] The test should verify that a `useTheme` hook returns the correct color mappings for each state (Success, Error, Thinking, Warning, Metadata).
- [ ] Verify that a `ThemeContext` provider correctly wraps Ink components and propagates theme settings.

## 2. Task Implementation
- [ ] Create a `Theme` type that defines the core palette:
  - `success`: `chalk.green`
  - `error`: `chalk.red`
  - `thinking`: `chalk.magenta`
  - `warning`: `chalk.yellow`
  - `metadata`: `chalk.gray`
- [ ] Implement a `TUIThemeProvider` component that uses React Context to share the theme.
- [ ] Implement a `useTheme` hook to easily access these styles in functional Ink components.
- [ ] Create a `StyledText` component that takes a `variant` prop (e.g., `<StyledText variant="success">Pass</StyledText>`) and applies the corresponding Chalk color.
- [ ] Ensure the theme adheres to the "Minimalist Authority" philosophy (clean typography, bold labels, purposeful use of color).

## 3. Code Review
- [ ] Verify that the theme system is extensible (e.g., supports dark/light mode if needed, though TUI usually follows terminal theme).
- [ ] Check for consistent use of `Chalk` across the TUI package for all styled output.
- [ ] Ensure no colors are hardcoded outside the theme definition.

## 4. Run Automated Tests to Verify
- [ ] Run the tests for `useTheme` and `StyledText`.
- [ ] Verify the correct ANSI color codes are generated in the test output (e.g., using snapshots of `chalk` outputs).

## 5. Update Documentation
- [ ] Document the available theme variants and the `useTheme` hook in `packages/cli/docs/styling.md`.
- [ ] Update the `AOD` (.agent.md) with guidelines for implementing new TUI components using the theme.

## 6. Automated Verification
- [ ] Run a script that renders a "Style Guide" component to the terminal, displaying all palette colors and their variants.
- [ ] Verify visually that the colors are distinguishable and appropriate.
