# Task: Define Iconography Tokens & Ghost Integration (Sub-Epic: 38_Iconography_Standards)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-005], [7_UI_UX_DESIGN-REQ-UI-DES-005-1]

## 1. Initial Test Written
- [ ] Create a unit test at `tests/iconography/tokens.test.ts` (Jest + AJV) that fails before implementation. The test must:
  - Import tokens: `const tokens = require('../../src/ui/iconography/tokens.json')`.
  - Import schema: `const schema = require('../../src/ui/iconography/schema.json')` and validate using AJV: `expect(ajv.validate(schema, tokens)).toBe(true)`.
  - Assert `tokens.sizes.small`, `tokens.sizes.medium`, and `tokens.sizes.large` exist and are numbers.
  - Assert `tokens.colors.iconForeground` and `tokens.colors.iconMuted` exist and are strings beginning with `"--vscode-"` (use regex /^--vscode-/).
  - Assert `tokens.ghost` exists and is either boolean `true` or an object describing ghost blend variables (test for `tokens.ghost.enabled === true || typeof tokens.ghost === 'object'`).
  - Provide clear failure messages showing missing keys or non-compliant token formats.

## 2. Task Implementation
- [ ] Implement `src/ui/iconography/tokens.json` and `src/ui/iconography/schema.json`.
  - `tokens.json` minimal example structure:

```json
{
  "sizes": { "small": 12, "medium": 16, "large": 20 },
  "colors": { "iconForeground": "--vscode-icon-foreground", "iconMuted": "--vscode-icon-muted" },
  "ghost": { "enabled": true, "blendVar": "--vscode-editor-background" }
}
```

  - `schema.json` must enforce presence and types of the fields above (use JSON Schema draft-07 compatible schema).
  - Commit files to `src/ui/iconography/`.

## 3. Code Review
- [ ] Verify the following before merging:
  - All color tokens reference CSS variables that begin with `--vscode-` (no hex values).
  - `schema.json` strictly validates keys and types; tests use AJV and fail on invalid tokens.
  - Files are formatted (prettier) and documented with a short header comment.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- tests/iconography/tokens.test.ts` (or `pnpm test -- tests/iconography/tokens.test.ts`) and confirm the test passes.

## 5. Update Documentation
- [ ] Add `docs/iconography.md` with:
  - Token list and example usages (CSS var usage and examples of how to consume sizes/colors in CSS-in-JS or tailwind).
  - Explanation of "ghost" integration semantic and examples of how to apply it (CSS mix with `--vscode-editor-background`).

## 6. Automated Verification
- [ ] Add `scripts/validate-icon-tokens.js` that loads `schema.json` and `tokens.json` and exits non-zero on validation failure; CI should run `node scripts/validate-icon-tokens.js` as part of the lint/test stage.
