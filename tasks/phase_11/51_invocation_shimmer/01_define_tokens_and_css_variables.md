# Task: Define design tokens and CSS variables for Invocation Shimmer (Sub-Epic: 51_Invocation_Shimmer)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-052-1]

## 1. Initial Test Written
- [ ] Create a failing unit test at `src/ui/animationTokens/__tests__/animationTokens.test.ts` that imports `getInvocationShimmerGradient` from `src/ui/animationTokens` and asserts all of the following:
  - The exported function exists and its type is a function.
  - The function returns a string when passed a deterministic theme object.
  - The returned string matches `/linear-gradient\(/`.
  - When passed `{ primary: '#F3F4F6', secondary: '#E5E7EB', accent: 'rgba(255,255,255,0.08)' }` the returned string contains the literal hex codes for primary and secondary in that order.
  - Run the test to confirm it fails (test-first requirement).

## 2. Task Implementation
- [ ] Implement `src/ui/animationTokens.ts` with the following minimal, fully-typed exports:
  - `export type Theme = { primary: string; secondary: string; accent?: string }`.
  - `export function getInvocationShimmerGradient(theme: Theme): string` which returns a deterministic `linear-gradient(90deg, <primary> 0%, <accent|transparent> 50%, <secondary> 100%)` string.
  - `export const INVOCATION_SHIMMER_CSS_VAR = '--invocation-shimmer-gradient'`.
- [ ] Add a small CSS snippet at `src/styles/_invocation-shimmer.css` (or Tailwind plugin snippet) with a single utility:
  - `:root { --invocation-shimmer-gradient: var(--vscode-editor-background, #f3f4f6); }`
  - `.invocation-shimmer { background-image: var(--invocation-shimmer-gradient); background-repeat: no-repeat; background-size: 200% 100%; }`
- [ ] Keep the implementation pure (no DOM or React imports) so the function is easy to unit test.

## 3. Code Review
- [ ] Verify the function is pure and deterministic for a given Theme input.
- [ ] Verify the CSS variable name uses the project prefix and is documented.
- [ ] Confirm there are sensible fallbacks and no hardcoded theme colors (only safe fallbacks allowed).
- [ ] Ensure file is small, typed, and well-documented (JSDoc comment explaining usage).

## 4. Run Automated Tests to Verify
- [ ] Run the project's test runner (e.g., `npm test` or `pnpm test`). Then run the new unit test specifically (example):
  - `npx jest src/ui/animationTokens --runInBand` (or the project equivalent). Confirm the test passes after implementation.

## 5. Update Documentation
- [ ] Update `docs/design/tokens.md` (or create it if missing) with a short note describing `--invocation-shimmer-gradient`, example usage in CSS, and a code snippet showing how to consume `getInvocationShimmerGradient` from JS/TS.

## 6. Automated Verification
- [ ] CI-friendly verification (if Jest available): `npx jest --json --outputFile=./tmp/invocation-shimmer-tokens.json` and assert `numFailedTests === 0` and `success === true` in the produced JSON. If the repo uses a different test runner, run the existing test runner and assert exit code 0.
