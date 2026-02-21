# Task: Implement Icon Fallback Mechanism (Sub-Epic: 39_Icon_Intent_Roles)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-064-2]

## 1. Initial Test Written
- [ ] Create unit tests at packages/ui/src/components/Icon/__tests__/icon-fallback.spec.tsx.
  - Test A: Render <Icon name="nonexistent" fallbackName="devs-default" /> and assert DOM contains `data-icon-name="devs-default"` and that a fallback SVG element is rendered.
  - Test B: Render <Icon name={undefined} /> and assert the component renders the configured default fallback (e.g., `devs-default` or `codicon:question`).
  - Test C: Simulate registry lookup failure (mock registry to return null) and assert the fallback is rendered and accessible fallback attributes exist (e.g., `role="img" aria-label="unknown icon"`).
  - Tests are written before implementation (TDD).

## 2. Task Implementation
- [ ] Update Icon lookup and component to support a fallback:
  - Add `fallbackName?: string` prop to Icon component with default `'devs-default'` or `'codicon:question'` depending on design.
  - Update registry lookup flow in `src/ui/components/Icon.tsx`:
    1. Compute normalizedName = normalizeIconName(name).
    2. Attempt to resolve SVG for normalizedName.
    3. If resolution returns null, compute normalizedFallback = normalizeIconName(fallbackName) and resolve that SVG.
    4. Render the fallback SVG and set attributes: `data-icon-name`, `data-icon-fallback="true"`, `aria-label` set to fallback descriptive text.
  - Add small utility `getIconSvg(name): SVGElement | null` exported from the icon registry module.

## 3. Code Review
- [ ] Verify:
  - Fallback path is well-typed and tested.
  - Accessibility attributes exist and are correct for screen readers.
  - No silent swallowing of errors – log a console.warn when fallback is used (but do not throw in the UI thread).

## 4. Run Automated Tests to Verify
- [ ] Run the newly added tests and UI package tests: `pnpm --filter packages/ui test -- --testPathPattern=icon-fallback` (adjust command to the repo's test runner).

## 5. Update Documentation
- [ ] Update `docs/ui/icons.md` with instructions on `fallbackName` prop, examples, and recommended default fallback choice for high-contrast / reduced motion modes.

## 6. Automated Verification
- [ ] Add an automated unit test that runs in CI which intentionally requests an unknown icon and asserts the fallback branch executes (makes the test part of `verify:icons` if appropriate).
