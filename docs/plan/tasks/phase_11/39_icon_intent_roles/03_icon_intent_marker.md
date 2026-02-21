# Task: Implement Icon Intent Marker (Sub-Epic: 39_Icon_Intent_Roles)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-064-3]

## 1. Initial Test Written
- [ ] Create unit tests at packages/ui/src/components/Icon/__tests__/icon-intent.spec.tsx.
  - Test A: Render <Icon name="check" intent="success" /> and assert the rendered wrapper has class `icon--intent-success` and `data-icon-intent="success"`.
  - Test B: Render <Icon name="warn" intent="warning" /> and assert `icon--intent-warning` is present and that `aria-label` includes the intent description (e.g., "warning icon").
  - Test C: Verify that absence of `intent` prop results in no intent class being added.
  - Tests must be written first (TDD).

## 2. Task Implementation
- [ ] Implement intent marker support in Icon component and styles:
  - Extend Icon props with `intent?: 'success' | 'warning' | 'danger' | 'info'`.
  - Add deterministic mapping in `src/ui/components/Icon.tsx` or `src/ui/style/token-mappings.ts` from intent -> design token (do not hardcode hex colors; reference `--vscode-` tokens or design token variables).
  - When `intent` is provided, add `className` `icon--intent-<intent>` and an attribute `data-icon-intent="<intent>"` to the wrapper.
  - Ensure intention is reflected in accessible attributes (e.g., `aria-label` or `aria-describedby`) per accessibility guidance.
  - Add Tailwind/CSS rule placeholders (e.g., `.icon--intent-success { color: var(--vscode-terminal-ansiGreen); }`) or map to tokens in JS-driven styles.

## 3. Code Review
- [ ] Verify:
  - Intent mapping uses design tokens and respects theme/high-contrast modes.
  - Accessibility: icons with intent either include an `aria-label` or are marked decorative (`aria-hidden="true"`) depending on usage; reviewer must decide per use-case and document.
  - No visual-only changes occur without tests.

## 4. Run Automated Tests to Verify
- [ ] Run tests for intent behavior: `pnpm --filter packages/ui test -- --testPathPattern=icon-intent` and ensure all tests pass.

## 5. Update Documentation
- [ ] Document `intent` prop in `docs/ui/icons.md` with examples mapping intents to design tokens and accessibility recommendations.

## 6. Automated Verification
- [ ] Add a snapshot test that captures the Icon output for each intent and include it in CI to detect regressions. Add a small script verifying CSS token values for each intent in the current theme if feasible.
