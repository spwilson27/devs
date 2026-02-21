# Task: Agency Authority Foundation (Types & Design Tokens) (Sub-Epic: 27_Agent_Hierarchy_Authority)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-002]

## 1. Initial Test Written
- [ ] Create a unit test in `packages/vscode/webview-ui/src/utils/authority.test.ts` to verify the existence of the `AuthorityLevel` enum and its associated style mapping utility functions.
- [ ] The test should ensure that mapping functions correctly return CSS variables/classes for each authority level (`HUMAN`, `AGENT`, `SYSTEM`).
- [ ] Verify that a `getAuthorityStyle` function returns the correct z-index, font-weight, and contrast-ratio constants for each level.

## 2. Task Implementation
- [ ] Define the `AuthorityLevel` enum in `packages/vscode/webview-ui/src/types/authority.ts` with values: `HUMAN` (Level 1), `AGENT` (Level 2), `SYSTEM` (Level 3).
- [ ] In `packages/vscode/webview-ui/src/styles/theme.css` (or equivalent Tailwind configuration), define the following design tokens as CSS variables:
    - `--devs-z-index-human`: 300
    - `--devs-z-index-agent`: 200
    - `--devs-z-index-system`: 100
    - `--devs-contrast-human`: 1.0 (Highest)
    - `--devs-contrast-agent`: 0.85
    - `--devs-contrast-system`: 0.7
    - `--devs-font-weight-human`: 700 (Bold)
    - `--devs-font-weight-agent`: 450 (Standard)
    - `--devs-font-weight-system`: 400 (Light/Mono)
- [ ] Implement a utility function `getAuthorityLevelStyles(level: AuthorityLevel)` that returns a set of Tailwind classes or a style object reflecting these tokens.

## 3. Code Review
- [ ] Verify that the authority levels correctly map to the "Source of Truth" (SoT) hierarchy.
- [ ] Ensure that the design tokens are theme-aware (using VSCode variables where appropriate, e.g., `--vscode-focusBorder` for human authority high contrast).
- [ ] Confirm the z-index hierarchy correctly layers Human > Agent > System.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test` in the `@devs/vscode` package to verify the authority level mappings.

## 5. Update Documentation
- [ ] Update the UI architecture documentation (e.g., `packages/vscode/docs/agency-hierarchy.md`) to explain the visual hierarchy of agency and the three authority levels.
- [ ] Document the CSS variables and how they should be used in new components.

## 6. Automated Verification
- [ ] Run a script to verify that `AuthorityLevel` is used in the codebase and that the CSS variables are defined in the main stylesheet.
