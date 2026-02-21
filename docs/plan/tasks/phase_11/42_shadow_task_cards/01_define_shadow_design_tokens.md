# Task: Define shadow design tokens (Sub-Epic: 42_Shadow_Task_Cards)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-047-3], [7_UI_UX_DESIGN-REQ-UI-DES-047-3-1], [7_UI_UX_DESIGN-REQ-UI-DES-047-3-2]

## 1. Initial Test Written
- [ ] Create a unit test at `packages/ui/src/__tests__/shadow-tokens.test.ts` (Jest) that imports `packages/ui/src/tokens/shadows.ts` (file to be implemented) and asserts exact equality for both token values:
  - expect(shadows.sm).toBe('0 2px 4px rgba(0,0,0,0.15)')
  - expect(shadows.md).toBe('0 8px 24px rgba(0,0,0,0.30)')
  Provide the exact test code below in the test file and run the package test runner until the test fails (Red).

## 2. Task Implementation
- [ ] Implement `packages/ui/src/tokens/shadows.ts` exporting a typed constant object and a default export, e.g.:
  ```ts
  export const SHADOWS = {
    sm: '0 2px 4px rgba(0,0,0,0.15)',
    md: '0 8px 24px rgba(0,0,0,0.30)'
  } as const;
  export default SHADOWS;
  ```
  Then add a small Node script `packages/ui/scripts/generate-css-tokens.js` that reads `SHADOWS` and writes `:root { --devs-shadow-sm: ...; --devs-shadow-md: ... }` to `packages/ui/dist/shadows.css` for consumers that prefer CSS variables.

## 3. Code Review
- [ ] Verify the tokens file uses explicit names (sm/md) matching the requirement, is typed, contains no magic strings outside the token definitions, and that the test imports the token module rather than hardcoding values. Ensure the Node script emits deterministic output and is idempotent.

## 4. Run Automated Tests to Verify
- [ ] Run the package test runner for the UI package (inspect `packages/ui/package.json` to determine the appropriate command; common commands: `npm test --workspace=@devs/ui`, `yarn workspace @devs/ui test`, or `pnpm -w test --filter @devs/ui`). Confirm the new test passes (Green).

## 5. Update Documentation
- [ ] Add or update `docs/ui/design_tokens.md` (or `packages/ui/README.md`) with a short section listing the two shadow tokens, their exact values, and a reference to the requirement IDs: 7_UI_UX_DESIGN-REQ-UI-DES-047-3, -3-1, -3-2. Include example usage for both CSS variables and the JS/TS token export.

## 6. Automated Verification
- [ ] Add `packages/ui/scripts/verify-shadows.js` that imports `packages/ui/src/tokens/shadows.ts` (via ts-node or compiled output) and exits non-zero if values differ from the specified strings; wire this script into CI as `verify:shadows` and document how to run it locally: `node packages/ui/scripts/verify-shadows.js`.
