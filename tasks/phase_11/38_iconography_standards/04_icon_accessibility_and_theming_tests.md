# Task: Icon Accessibility & Theming Tests (Sub-Epic: 38_Iconography_Standards)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-005-1], [7_UI_UX_DESIGN-REQ-UI-DES-005-2]

## 1. Initial Test Written
- [ ] Write accessibility and theming tests at `tests/a11y/icon-a11y.test.tsx` using Jest + React Testing Library + jest-axe. Tests to author first:
  - Render `<Icon>` in three theme contexts by injecting CSS variables into `document.documentElement.style`: default, high-contrast (override token values to simulate HC), and ghost-mode (set `--ghost-enabled: true` and blend var overrides).
  - For each render, run `const results = await axe(container)` and assert `expect(results).toHaveNoViolations()`.
  - For icons that convey meaning (non-decorative), assert `getByLabelText('...')` exists; for decorative icons assert `queryByLabelText` is null and `container.querySelector('[aria-hidden="true"]')` exists.
  - Programmatically compute contrast ratio of `getComputedStyle(icon).color` vs `getComputedStyle(background).backgroundColor` using a small utility (e.g., `color-contrast` package) and assert it meets the token-based threshold (>= 4.5:1 for icons that must be legible).

## 2. Task Implementation
- [ ] Implement test helpers and component updates:
  - Add `tests/utils/theme-provider.tsx` helper that mounts components with specified CSS variable overrides.
  - Ensure `Icon` reads color tokens via CSS variables (no hardcoded colors).
  - Implement ghost-mode CSS class (`.icon--ghost`) that uses the `tokens.ghost.blendVar` for its mix semantics.

## 3. Code Review
- [ ] Review for:
  - Proper ARIA behavior (non-decorative icons require label/title).
  - Test coverage for HC and ghost mode.
  - No hardcoded color usage.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/a11y/icon-a11y.test.tsx` and confirm no axe violations.

## 5. Update Documentation
- [ ] Update `docs/iconography.md` with accessibility rules: when to mark icons decorative, required contrast rules, and how ghost mode should behave.

## 6. Automated Verification
- [ ] CI step `test:a11y` should run these tests and fail the build on violations; add a pre-merge gate to enforce this.
