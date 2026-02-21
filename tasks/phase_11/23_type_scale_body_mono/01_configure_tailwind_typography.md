# Task: Configure Tailwind Custom Type Scale and Line Heights (Sub-Epic: 23_Type_Scale_Body_Mono)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-033-4], [7_UI_UX_DESIGN-REQ-UI-DES-033-5], [7_UI_UX_DESIGN-REQ-UI-DES-033-6], [7_UI_UX_DESIGN-REQ-UI-DES-035]

## 1. Initial Test Written
- [ ] Create a Vitest test suite in `packages/webview/src/theme/__tests__/typography.test.ts` to verify that the Tailwind configuration produces the correct CSS values.
- [ ] Use `resolveConfig` from `tailwindcss` to verify that:
    - `fontSize.body` is `13px` (or `0.8125rem`).
    - `fontSize.mono` is `12px` (or `0.75rem`).
    - `fontSize.metadata` is `11px` (or `0.6875rem`).
    - `lineHeight.narrative` is `1.6`.
    - `lineHeight.technical` is `1.4`.
    - `lineHeight.navigation` is `1.2`.

## 2. Task Implementation
- [ ] Modify `packages/webview/tailwind.config.js` to extend the `theme.fontSize` and `theme.lineHeight` sections.
- [ ] Add the following tokens:
    ```javascript
    {
      fontSize: {
        'devs-body': '13px',
        'devs-mono': '12px',
        'devs-metadata': '11px',
      },
      lineHeight: {
        'devs-narrative': '1.6',
        'devs-technical': '1.4',
        'devs-navigation': '1.2',
      }
    }
    ```
- [ ] Ensure these tokens are available for use in the Webview project.

## 3. Code Review
- [ ] Verify that the names follow the project's naming convention (`devs-*` prefix).
- [ ] Ensure that the values exactly match the requirements in `7_UI_UX_DESIGN`.
- [ ] Check that no existing standard Tailwind classes are accidentally overwritten if not intended.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` in the `packages/webview` directory to ensure the typography configuration tests pass.

## 5. Update Documentation
- [ ] Update `docs/ui/typography.md` (if it exists) or create a section in the Webview's `README.md` documenting the custom typography scale and line heights.

## 6. Automated Verification
- [ ] Run a script that extracts the generated CSS from the build and verifies the presence of `.text-devs-body { font-size: 13px; }` and related classes.
