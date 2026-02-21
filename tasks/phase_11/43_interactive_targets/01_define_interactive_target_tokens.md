# Task: Define design tokens & Tailwind utilities for interactive targets and standard button metrics (Sub-Epic: 43_Interactive_Targets)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-048], [7_UI_UX_DESIGN-REQ-UI-DES-048-2]

## 1. Initial Test Written
- [ ] Create a unit test at packages/ui/src/__tests__/design-tokens.test.ts that imports the token module and asserts the canonical values:
  - expect(tokens.interactiveTargetSize).toBe('24px')
  - expect(tokens.buttonMetrics).toMatchObject({ minWidth: '24px', minHeight: '24px', padding: '6px 12px', borderRadius: '4px' })
- [ ] Test must run under the project unit test runner (Jest). Example run command: npm test -- packages/ui -- -t design-tokens

## 2. Task Implementation
- [ ] Implement the canonical tokens module at packages/ui/src/design/tokens.ts and export named constants:
  - export const interactiveTargetSize = '24px'
  - export const buttonMetrics = { minWidth: '24px', minHeight: '24px', padding: '6px 12px', borderRadius: '4px', fontSize: '13px' }
- [ ] Update tailwind.config.js (root or packages/ui) to map tokens to utilities:
  - Add theme.extend.spacing['interactive-target'] = '24px'
  - Add theme.extend.borderRadius['btn'] = '4px'
  - Add (or update) a Tailwind plugin to generate a .btn-standard utility using the buttonMetrics token values (padding, min-width, min-height, border-radius, font-size).
- [ ] Add a typed export file packages/ui/src/design/types.d.ts describing the token shapes.

## 3. Code Review
- [ ] Verify no literal '24px' values remain in component code; all references must use the tokens module or generated CSS variables.
- [ ] Ensure Tailwind utilities are generated from tokens at build-time (prefer token->CSS variable mapping over scattered hardcodes).
- [ ] Confirm theme-awareness (token values adapt to dark/high-contrast if applicable) and that colors are not hard-coded here.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- packages/ui -- -t design-tokens and confirm the new test passes locally.
- [ ] Run a quick runtime check: node -e "console.log(require('./packages/ui/src/design/tokens').interactiveTargetSize)" and verify output is "24px".

## 5. Update Documentation
- [ ] Create docs/ui/interactive-targets.md describing:
  - The interactiveTargetSize token and rationale (24px minimum),
  - The .btn-standard utility and examples showing markup and expected visual output,
  - Guidelines for when to wrap an icon with interactive padding versus enlarging the icon itself.

## 6. Automated Verification
- [ ] Add scripts/verify-tokens.js that requires packages/ui/src/design/tokens and exits non-zero if interactiveTargetSize !== '24px' or buttonMetrics.minWidth !== '24px'; add npm script "verify:tokens" and wire into CI pre-checks.