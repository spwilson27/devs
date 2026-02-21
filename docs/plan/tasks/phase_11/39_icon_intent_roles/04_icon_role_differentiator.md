# Task: Implement Icon Role Differentiator (Sub-Epic: 39_Icon_Intent_Roles)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-064-4]

## 1. Initial Test Written
- [ ] Create unit tests at packages/ui/src/components/Icon/__tests__/icon-role.spec.tsx.
  - Test A: Render <Icon name="user" role="developer" /> and assert wrapper has `data-icon-role="developer"` and class `icon--role-developer`.
  - Test B: Render <Icon name="user" role="reviewer" /> and assert `data-icon-role="reviewer"` and class `icon--role-reviewer`.
  - Test C: Verify role mapping aligns with color conventions defined in the UI design (developer=blue, reviewer=orange, architect=green).
  - Tests are written first (TDD).

## 2. Task Implementation
- [ ] Implement role differentiator in Icon component:
  - Extend Icon props with `role?: 'developer' | 'reviewer' | 'architect' | 'system'`.
  - Add mapping file `src/ui/components/Icon/role-mapping.ts` that exports an object mapping role -> design token (e.g., `{ developer: '--vscode-developer-blue', reviewer: '--vscode-reviewer-orange', architect: '--vscode-architect-green' }`).
  - Icon should add `data-icon-role` and `className` `icon--role-<role>` when role is provided.
  - Ensure color application references design tokens and respects theme/high-contrast, not hardcoded hex values.

## 3. Code Review
- [ ] Verify:
  - Role mappings are documented and typed.
  - Implementation does not duplicate token definitions; it references central token mapping.
  - Verify accessibility: role does not replace semantic labeling and that ARIA attributes remain correct.

## 4. Run Automated Tests to Verify
- [ ] Run the new tests and UI package tests: `pnpm --filter packages/ui test -- --testPathPattern=icon-role` (adjust to repo tooling).

## 5. Update Documentation
- [ ] Update `docs/ui/icons.md` to document `role` prop, the role-to-color mapping, and examples for developer/reviewer/architect icons.

## 6. Automated Verification
- [ ] Add a CI-time test that iterates supported roles and renders icons to ensure role classes/tokens exist and produce non-empty computed styles; include test in PR checks.
