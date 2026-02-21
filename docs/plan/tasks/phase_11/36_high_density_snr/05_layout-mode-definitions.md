# Task: Implement layout mode definitions and UI toggle (standard 25/75, wide tri-pane) (Sub-Epic: 36_High_Density_SNR)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-062]

## 1. Initial Test Written
- [ ] Add unit tests at src/ui/layout/__tests__/LayoutMode.test.tsx:
  - Test LayoutProvider default mode is 'standard'.
  - Test toggling to 'wide' updates provider and LayoutContainer applies gridTemplateColumns '25% 75%'.
  - Test 'wide' mode applies tri-pane gridTemplateColumns '20% 60% 20%'.
  - Add an E2E Cypress test that resizes viewport to >=1280px and asserts the tri-pane layout appears.

Example unit snippet:

```ts
// assert computed style gridTemplateColumns for standard and wide modes
```

## 2. Task Implementation
- [ ] Implement src/ui/layout/LayoutProvider.tsx and src/ui/layout/LayoutContainer.tsx:
  - export type LayoutMode = 'standard'|'wide';
  - Provider should auto-detect window.innerWidth >= 1280 => 'wide' unless user manually toggled (persist override to localStorage).
  - LayoutContainer applies CSS grid with columns:
    - standard: grid-template-columns: 25% 75%;
    - wide: grid-template-columns: 20% 60% 20% (tri-pane).
  - Provide a small ToggleButton component to manually switch modes; add keyboard shortcut and aria attributes.

## 3. Code Review
- [ ] Verify theme tokens and CSS variables used (no hard-coded colors or fonts).
- [ ] Confirm persistence of user override and that auto-switch respects manual override.
- [ ] Confirm tests cover both auto-detection and manual toggle flows.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- src/ui/layout --silent
- [ ] Run E2E Cypress test: npx cypress run --spec "cypress/e2e/layout_mode.cy.ts"

## 5. Update Documentation
- [ ] Add docs/ui/layout_modes.md describing breakpoints, standard (25/75) and wide tri-pane behaviour, and persistence details.

## 6. Automated Verification
- [ ] Add visual regression snapshots for both standard and wide modes and an automated assertion script that queries computedStyle.gridTemplateColumns and verifies expected values.
