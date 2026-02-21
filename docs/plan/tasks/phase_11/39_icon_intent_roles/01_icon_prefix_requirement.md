# Task: Implement Icon Prefix Enforcement (Sub-Epic: 39_Icon_Intent_Roles)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-064-1]

## 1. Initial Test Written
- [ ] Create a unit test file at packages/ui/src/components/Icon/__tests__/icon-prefix.spec.tsx using Jest + React Testing Library.
  - Test A: Render <Icon name="check" /> and assert the rendered root element includes attribute `data-icon-name="devs-check"`.
  - Test B: Render <Icon name="codicon:debug-alt" /> and assert `data-icon-name="codicon:debug-alt"` is preserved.
  - Test C: Render <Icon name="devs-alert" /> and assert `data-icon-name="devs-alert"` is preserved.
  - Tests should be written first and must fail before implementation (TDD).

## 2. Task Implementation
- [ ] Implement a normalization helper and integrate into the Icon component:
  - Add `src/ui/components/Icon/icon-utils.ts` with `export function normalizeIconName(name: string | undefined): string`.
  - Normalization rules:
    - If name matches vendor namespace (regex: `/^(codicon:|vscode:|devs:)/i`), return name unchanged.
    - If name is null/undefined/empty, return a sentinel `devs-default` (fallback task will cover replacement SVG).
    - Otherwise return `devs-${name}`.
  - Update `src/ui/components/Icon.tsx` to call `normalizeIconName(name)` and set `data-icon-name` on the rendered wrapper; use the normalized key to resolve SVG from the icon registry.
  - Export the helper and add TypeScript types and JSDoc.

## 3. Code Review
- [ ] During review ensure:
  - `normalizeIconName` is pure, well-typed, and has unit tests covering vendor namespaces and edge-cases.
  - No visual styling or color choices are introduced in this change (only name normalization and lookup).
  - The implementation reuses existing icon registry/hooks (e.g. `@devs/ui-hooks`) if present; otherwise a minimal registry module is added under `src/ui/icons`.

## 4. Run Automated Tests to Verify
- [ ] Run the unit tests and lint checks for the UI package (adjust to repo tooling):
  - `pnpm --filter packages/ui test -- --testPathPattern=icon-prefix` OR
  - `yarn test packages/ui --testPathPattern=icon-prefix` OR
  - `npm run test --workspace packages/ui -- --testPathPattern=icon-prefix`.
- [ ] Ensure the three tests added pass.

## 5. Update Documentation
- [ ] Update `docs/ui/icons.md` (or `packages/ui/README.md`) with:
  - The prefix rule: custom icons MUST be namespaced with the `devs-` prefix unless using a vendor namespace (codicon:, vscode:, devs:).
  - Examples showing correct and incorrect usages.
  - A one-line migration note for existing code.

## 6. Automated Verification
- [ ] Add a lightweight verifier script at `scripts/verify-icon-prefix.js` that scans `src/**/*.{tsx,jsx,ts,js}` for literal Icon usages and fails when a literal icon name is found without a vendor prefix or `devs-` prefix. Add a package.json script `verify:icons` and include it in PR CI.
