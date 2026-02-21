# Task: Core Theme Token Mapping (Sub-Epic: 14_Theme_Variable_Mapping)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-071], [7_UI_UX_DESIGN-REQ-UI-DES-010]

## 1. Initial Test Written
- [ ] Create a unit test `themeMapper.test.ts` in `@devs/vscode` to verify that the theme mapping utility correctly identifies and returns VSCode CSS variables for given semantic tokens (e.g., `primary-bg` -> `var(--vscode-editor-background)`).
- [ ] Write a test to ensure that the Tailwind configuration correctly resolves custom theme extensions to these CSS variables.

## 2. Task Implementation
- [ ] Create a `constants/themeTokens.ts` file that defines a mapping between internal semantic names (e.g., `background`, `foreground`, `border`, `button-bg`) and standard VSCode CSS variables (e.g., `--vscode-sideBar-background`, `--vscode-foreground`, etc.).
- [ ] Configure `tailwind.config.js` in the Webview project to use these variables in the `theme.extend` section, allowing the use of classes like `bg-vscode-bg` or `text-vscode-fg`.
- [ ] Ensure that the mapping covers all primary UI zones defined in the architecture (Sidebar, Editor, Activity Bar).

## 3. Code Review
- [ ] Verify that NO hardcoded hex, RGB, or HSL values are present in the token mapping.
- [ ] Ensure the naming convention for semantic tokens is consistent and follows the "Glass-Box" philosophy.
- [ ] Confirm that the Tailwind configuration is properly typed.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm test themeMapper.test.ts` and ensure all mappings resolve to the expected CSS variables.
- [ ] Run the Webview build and inspect the generated CSS to confirm Tailwind utility classes are using `var(--vscode-*)`.

## 5. Update Documentation
- [ ] Update `docs/ui/theme-guide.md` (or create it) to list the available semantic tokens and their corresponding VSCode variables for future developer reference.

## 6. Automated Verification
- [ ] Run a grep script `scripts/verify_no_hardcoded_colors.sh` that searches the `src/` directory for hex codes (e.g., `#ffffff`) and fails if any are found in styling files (excluding legitimate exceptions like ANSI palette definitions if strictly necessary).
