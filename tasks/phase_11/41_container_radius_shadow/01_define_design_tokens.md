# Task: Define UI design tokens for container radius and border width (Sub-Epic: 41_Container_Radius_Shadow)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-047]
- [7_UI_UX_DESIGN-REQ-UI-DES-047-1]
- [7_UI_UX_DESIGN-REQ-UI-DES-047-2]

## 1. Initial Test Written
- [ ] Create a unit test at tests/ui/tokens.spec.ts (or packages/ui/tests/tokens.spec.ts) using the project's test runner (vitest or jest). The test MUST import the project's Tailwind configuration file (e.g. require('../../tailwind.config.cjs') or import config from '../../../tailwind.config.ts') and assert the following keys and values exist in theme.extend:
  - expect(config.theme.extend.borderRadius?.card).toBe('4px')
  - expect(config.theme.extend.borderWidth?.card).toBe('1px')
  - expect(config.theme.extend.boxShadow?.['card-sm']).toBeDefined()
  - expect(config.theme.extend.boxShadow?.['card-md']).toBeDefined()

The test should be written first and should fail before implementation (TDD).

## 2. Task Implementation
- [ ] Modify or create the Tailwind configuration (tailwind.config.{js,cjs,ts}) and add design tokens under theme.extend:
  - borderRadius.card = '4px'
  - borderWidth.card = '1px'
  - boxShadow['card-sm'] = '0 1px 2px rgba(0,0,0,0.06)'
  - boxShadow['card-md'] = '0 4px 8px rgba(0,0,0,0.08)'
- [ ] Add CSS variables in a single source file (src/ui/styles/_devs_tokens.css or src/styles/devs-tokens.css):
  - :root {
    --devs-radius-card: 4px;
    --devs-border-card: 1px;
    --devs-shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
    --devs-shadow-md: 0 4px 8px rgba(0,0,0,0.08);
  }
- [ ] Add a small Tailwind plugin or extend utilities so tokens are available as utilities and classnames (e.g. rounded-card, border-card, shadow-card-sm, shadow-card-md). Prefer a mapping to the CSS variables so runtime theme switching and high-contrast fallbacks can be supported.
- [ ] Build the UI bundle (npm run build:ui or repo build command) and verify compiled CSS contains the new tokens/utilities.

## 3. Code Review
- [ ] Verify the following during code review:
  - Tokens are defined in one canonical place (tailwind.config and tokens CSS file) and referenced by components, not duplicated.
  - No component hard-codes literal '4px' or '1px' values; components must consume tokens.
  - Shadow values are expressed through CSS variables so High-Contrast mode can override them.
  - Changes include unit tests that assert tokens are present.

## 4. Run Automated Tests to Verify
- [ ] Run the test added in step 1: npm test -- tests/ui/tokens.spec.ts (or pnpm test) and confirm it transitions from failing to passing after implementation.
- [ ] Run the UI build step to ensure the new CSS compiles without warnings.

## 5. Update Documentation
- [ ] Create or update docs/ui/design-tokens.md describing:
  - The token names and their intended usage (borderRadius.card, borderWidth.card, boxShadow.card-sm/card-md).
  - How to consume tokens in components (Tailwind utility names and CSS variable examples).
  - How to add new tokens and how High-Contrast overrides should be provided.

## 6. Automated Verification
- [ ] Add a verification script at scripts/verify-tokens.js (node) that imports the tailwind config and asserts the presence of the keys above; exit non-zero on mismatch. Add this script to CI lint/test stage so tokens are enforced automatically.
