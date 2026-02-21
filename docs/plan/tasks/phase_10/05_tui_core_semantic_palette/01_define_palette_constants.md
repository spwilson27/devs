# Task: Define TUI Semantic Palette Constants (Sub-Epic: 05_TUI Core Semantic Palette)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-024-1], [7_UI_UX_DESIGN-REQ-UI-DES-024-2], [7_UI_UX_DESIGN-REQ-UI-DES-024-3], [7_UI_UX_DESIGN-REQ-UI-DES-024-4], [7_UI_UX_DESIGN-REQ-UI-DES-024-5]

## 1. Initial Test Written
- [ ] Create a unit test in `packages/cli/src/tui/theme/__tests__/palette.test.ts` that verifies the `palette` object contains the correct ANSI color codes for all semantic keys.
- [ ] Test should assert that:
    - `palette.success` maps to ANSI 2 (primary) and ANSI 10 (light).
    - `palette.error` maps to ANSI 1 and ANSI 9.
    - `palette.thinking` maps to ANSI 5 and ANSI 13.
    - `palette.warning` maps to ANSI 3 and ANSI 11.
    - `palette.metadata` maps to ANSI 8.

## 2. Task Implementation
- [ ] Create `packages/cli/src/tui/theme/palette.ts`.
- [ ] Define an interface `SemanticColor` with `base` and `light` properties (where applicable).
- [ ] Export a `palette` constant that implements the following mapping:
    - **Success**: { base: 'green', light: 'greenBright' } (ANSI 2/10)
    - **Error**: { base: 'red', light: 'redBright' } (ANSI 1/9)
    - **Thinking**: { base: 'magenta', light: 'magentaBright' } (ANSI 5/13)
    - **Warning**: { base: 'yellow', light: 'yellowBright' } (ANSI 3/11)
    - **Metadata**: { base: 'grey' } (ANSI 8 / Bright Black)
- [ ] Ensure the values are compatible with `Chalk` or `Ink`'s `Color` component props.

## 3. Code Review
- [ ] Verify that the palette uses semantic names rather than literal color names.
- [ ] Ensure types are strictly defined to prevent typos in semantic keys.
- [ ] Check that the implementation allows for future expansion (e.g., adding TrueColor hex codes alongside ANSI codes).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/cli/src/tui/theme/__tests__/palette.test.ts` and ensure all assertions pass.

## 5. Update Documentation
- [ ] Update `packages/cli/README.md` or a dedicated TUI style guide in `docs/` to document the semantic palette and its intended usage.

## 6. Automated Verification
- [ ] Run a script that imports the palette and prints the raw ANSI escape codes to a temporary file, then validates the escape codes against the expected ANSI numbers (1, 2, 3, 5, 8, 9, 10, 11, 13).
