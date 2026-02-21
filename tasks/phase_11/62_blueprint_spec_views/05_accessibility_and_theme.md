# Task: Accessibility and Theme-aware Styling for Spec Previewer (Sub-Epic: 62_Blueprint_Spec_Views)

## Covered Requirements
- [4_USER_FEATURES-REQ-008]

## 1. Initial Test Written
- [ ] Add accessibility and theme unit tests:
  - `src/webview/components/__tests__/SpecView.a11y.test.tsx` using `jest-axe`:
    - Render `SpecView` with a representative blueprint markdown and run `axe(container)`; assert zero violations.
  - `src/webview/components/__tests__/theme-sync.test.tsx`:
    - Mock `vscode.getState()` or the theme token provider; assert that `MarkdownRenderer` and `MermaidHost` adjust styling (CSS variables set correctly) for `light` and `dark` themes.
  - Run: `npx jest src/webview/components/__tests__/SpecView.a11y.test.tsx --runInBand --json --outputFile=tmp/spec-a11y-test.json`

## 2. Task Implementation
- [ ] Implement theme & accessibility changes:
  - Ensure the spec previewer reads VSCode design tokens (`--vscode-foreground`, `--vscode-background`, etc.) via `vscode.getState()` or host-provided API and maps them to CSS variables inside the webview Shadow DOM.
  - Avoid hardcoded colors; use CSS variables and provide fallback system fonts.
  - Ensure keyboard navigation: link anchors are reachable via Tab; Enter activates navigation; tooltip previews are accessible via keyboard focus.
  - Add `aria-live="polite"` to the area where spec updates or sign-off messages appear.

## 3. Code Review
- [ ] Verify:
  - No hardcoded colors; all colors flow from VSCode tokens.
  - All interactive elements have appropriate ARIA roles/labels and focus styles.
  - Axe tests added and pass locally.

## 4. Run Automated Tests to Verify
- [ ] Run accessibility and theme tests:
  - `npx jest src/webview/components/__tests__/SpecView.a11y.test.tsx --runInBand --json --outputFile=tmp/spec-a11y-test.json`
  - Confirm zero axe violations recorded in the test output.

## 5. Update Documentation
- [ ] Update `docs/accessibility.md` with:
  - Theme mapping table (which `--vscode-*` tokens are mapped to which CSS variables), keyboard navigation expectations, and aria roles used by the previewer.

## 6. Automated Verification
- [ ] Programmatic verification:
  - Run jest with the a11y test and then run `node -e "const r=require('./tmp/spec-a11y-test.json'); process.exit(r.numFailedTests===0 && r.numTotalTests>0 ? 0 : 1)"` to ensure tests actually ran and passed.

