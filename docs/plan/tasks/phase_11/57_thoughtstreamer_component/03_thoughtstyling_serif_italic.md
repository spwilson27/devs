# Task: Apply serif italic styling to ThoughtStreamer messages (Sub-Epic: 57_ThoughtStreamer_Component)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-017]

## 1. Initial Test Written
- [ ] Create a style unit test at src/ui/components/__tests__/ThoughtStreamer.style.spec.tsx that renders a sample message and asserts the message element has the expected className (e.g., contains 'font-serif' and 'italic') or computed style includes font-style: italic and a serif family fallback.

## 2. Task Implementation
- [ ] Implement styling using Tailwind or CSS modules:
  - Apply a semantic class to narrative/thought content (e.g., .thoughtstreamer-message) that maps to a serif font stack and italic style.
  - Ensure usage of VSCode theme tokens / CSS variables (e.g., --vscode-font-family-serif) so font mapping is theme-aware and no hardcoded remote fonts are introduced.
  - If the webview is Shadow DOM isolated, ensure styles are injected into the shadow root or bundled with the webview build.

## 3. Code Review
- [ ] Verify no hardcoded font URLs, confirm fallback stack includes system serif(s), ensure italic is only applied to narrative/thought text, and confirm styles are responsive to theme/token changes.

## 4. Run Automated Tests to Verify
- [ ] Run style tests and perform a manual run of the extension webview (npm run webview:dev) to visually confirm serif/italic appearance.

## 5. Update Documentation
- [ ] Document the styling contract in docs/ui/thoughtstreamer.md including the Tailwind classes or CSS module selectors used and the expected semantic intent.

## 6. Automated Verification
- [ ] Add a Playwright/Puppeteer screenshot assertion (small region) for the message text to detect regressions in typography; fail CI on significant pixel diffs.
