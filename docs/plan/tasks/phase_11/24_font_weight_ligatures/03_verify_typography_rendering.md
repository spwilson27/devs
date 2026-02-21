# Task: Verify Code Block Typography Rendering in Webview (Sub-Epic: 24_Font_Weight_Ligatures)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-037], [7_UI_UX_DESIGN-REQ-UI-DES-037-1], [7_UI_UX_DESIGN-REQ-UI-DES-037-2]

## 1. Initial Test Written
- [ ] Create a Playwright or Cypress E2E test for the VSCode Webview that attempts to render a project with a task in the implementation phase (e.g., in Phase 4) that generates a code block in the `ThoughtStreamer`.
- [ ] Write the test to locate the `<code>` element in the Webview and capture its computed style properties (`font-weight`, `font-variant-ligatures`).

## 2. Task Implementation
- [ ] Ensure that the Webview bundle is correctly updated with the new CSS and component changes.
- [ ] Add a script or a dedicated test-page in the Webview that displays all supported code block variations (e.g., different languages, with/without ligatures).
- [ ] Configure the E2E test to visit this test-page or the live `ThoughtStreamer` view.
- [ ] Verify that the `font-weight` is either `450` or `500` and the `font-variant-ligatures` is `contextual`.

## 3. Code Review
- [ ] Check for any visual regression in the `ThoughtStreamer` or `LogTerminal` views.
- [ ] Ensure that the typography styles are consistent across light and dark VSCode themes.
- [ ] Confirm that the font weight and ligatures are applied correctly and do not interfere with syntax highlighting.

## 4. Run Automated Tests to Verify
- [ ] Execute the E2E test suite (`npm run test:e2e`) to verify the rendering in a headless browser (or a simulated Webview environment).

## 5. Update Documentation
- [ ] Update the Phase 11 documentation (e.g., `phases/phase_11.md` or a status report) to indicate the successful implementation of the typography requirements.

## 6. Automated Verification
- [ ] Run a Playwright script that asserts: `expect(getComputedStyle(codeElement).fontWeight).toBe('450' || '500')` and `expect(getComputedStyle(codeElement).fontVariantLigatures).toBe('contextual')`.
