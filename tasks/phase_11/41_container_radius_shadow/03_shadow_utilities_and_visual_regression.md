# Task: Implement shadow utilities and visual regression tests (Sub-Epic: 41_Container_Radius_Shadow)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-047]

## 1. Initial Test Written
- [ ] Create two tests:
  - Unit test at tests/ui/shadows.spec.ts that imports the Tailwind config and asserts that 'card-sm' and 'card-md' boxShadow tokens are defined in theme.extend.boxShadow.
  - Visual regression test (jest-image-snapshot or Playwright snapshot) at tests/visual/card-shadow.spec.ts that renders a minimal Card component with 'sm' and 'md' elevation and captures screenshot(s) for baseline comparison. The visual test should be authored to fail until the implementation is complete.

## 2. Task Implementation
- [ ] Implement shadow utilities in the UI codebase:
  - Ensure tailwind.config.* contains boxShadow['card-sm'] and boxShadow['card-md'] (defined as variables or direct rgba values per design tokens).
  - Create utility classnames (shadow-card-sm, shadow-card-md) that map to the tokens or CSS variables.
  - Ensure the Card component and any container components use these utilities by default.
- [ ] Integrate visual regression tooling (if not present):
  - Add jest-image-snapshot (or Storybook + Chromatic / Playwright snapshot) configuration minimal for CI.
  - Add a script npm run test:visual to run the visual suite locally and in CI.

## 3. Code Review
- [ ] Verify:
  - Shadow intensity is subtle and suitable for VSCode panels (low contrast by default).
  - Implementation uses tokens/CSS variables so High-Contrast mode can override values.
  - Visual regression baselines are checked into a dedicated /tests/visual/baselines directory with README explaining how to update baselines.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: npm test tests/ui/shadows.spec.ts and confirm passing.
- [ ] Run visual tests: npm run test:visual and confirm that captured images match baselines (or update baselines intentionally with a documented process).

## 5. Update Documentation
- [ ] Document the shadow tokens in docs/ui/design-tokens.md including recommended usage patterns (when to use sm vs md), accessibility guidance for High-Contrast and reduced-motion modes, and how to update baselines for visual tests.

## 6. Automated Verification
- [ ] Add a CI check that runs the visual tests and fails on any pixel diffs over a tiny threshold (e.g., 0.1%); place this check into CI/test stage so agents cannot falsely claim tests passed without the visual suite.
