# Task: Define Narrative Typography Tokens (Sub-Epic: 19_Narrative_Font_Intent)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-015], [7_UI_UX_DESIGN-REQ-UI-DES-031-2]

## 1. Initial Test Written
- [ ] Create a Vitest test in `tests/ui/theme/typography.test.ts` to verify that the narrative font variables are correctly defined and mapped to the expected VSCode tokens and font stacks.
- [ ] Verify that `--devs-font-narrative` contains the serif stack: `"Georgia", "Times New Roman", "Source Serif Pro", serif`.
- [ ] Verify that `--devs-thinking-color` is mapped to `var(--vscode-symbolIcon-propertyForeground)`.

## 2. Task Implementation
- [ ] Define CSS variables in the global CSS file (e.g., `src/webview/styles/main.css`) for narrative typography:
  - `--devs-font-narrative: "Georgia", "Times New Roman", "Source Serif Pro", serif;`
  - `--devs-thinking-color: var(--vscode-symbolIcon-propertyForeground);`
- [ ] Update the Tailwind configuration (`tailwind.config.js`) to include a `narrative` font family that utilizes this CSS variable.
- [ ] Ensure the font size for the narrative stack is configured between `15px-16px` as per requirement.

## 3. Code Review
- [ ] Verify that the font stack matches the specification exactly to maintain the "Glass-Box" narrative aesthetic.
- [ ] Ensure that no hardcoded hex colors are used, strictly adhering to VSCode theme tokens for the thinking color.
- [ ] Check that the Tailwind config is properly extending the theme rather than overwriting it.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test tests/ui/theme/typography.test.ts` to ensure the tokens are correctly exposed to the UI layer.

## 5. Update Documentation
- [ ] Update `docs/ui/typography.md` (if it exists) or the agent's memory to reflect the new narrative font tokens.

## 6. Automated Verification
- [ ] Run a script to verify that `tailwind.config.js` contains the `narrative` font family definition.
