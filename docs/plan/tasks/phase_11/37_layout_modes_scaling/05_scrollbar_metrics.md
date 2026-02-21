# Task: Implement Slim 8px Scrollbar Metrics and Cross-Platform Fallback (Sub-Epic: 37_Layout_Modes_Scaling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-049-4]

## 1. Initial Test Written
- [ ] Add tests:
  - Unit snapshot tests for generated CSS utility `.scrollbar-slim` in `packages/ui/src/styles/__tests__/scrollbars.spec.css` ensuring rules include `::-webkit-scrollbar { width: 8px; height: 8px }` and `scrollbar-width: thin`.
  - Playwright measurement test `tests/e2e/scrollbar.spec.ts` that mounts an overflow container with `.scrollbar-slim` and measures the measured scrollbar width via `element.offsetWidth - element.clientWidth` or platform-specific APIs, asserting ~8px ±1px for Chromium; assert fallback pseudo-element exists for overlay-scrollbar platforms.

## 2. Task Implementation
- [ ] Implement CSS and optional JS fallback:
  - Add `packages/ui/src/styles/scrollbars.css`:
    - `.scrollbar-slim { scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) var(--scroll-track); }`
    - `.scrollbar-slim::-webkit-scrollbar { width: 8px; height: 8px; }`
    - `.scrollbar-slim::-webkit-scrollbar-thumb { border-radius: 6px; background-color: var(--scroll-thumb); min-height: 24px; }`
  - Add a small JS utility `packages/ui/src/utils/scrollbar-detect.ts` to detect overlay scrollbars and apply an accessible custom overlay track/thumb only when necessary; the overlay must expose keyboard controls and `aria-controls`.
  - Register a Tailwind utility plugin (or a small CSS import) to provide `.scrollbar-slim` as a utility class for the webview bundle and ensure colors map to `--vscode-*` tokens.
  - Integrate `.scrollbar-slim` into main scrollable containers (DAGCanvas scroll wrapper, ThoughtStreamer log wrappers) via className.

## 3. Code Review
- [ ] Verify:
  - CSS uses theme variables and does not hardcode colors; contrast is acceptable for high-contrast mode.
  - Fallback overlay solution is accessible (keyboard operable and has proper ARIA attributes) and only injected when necessary.
  - No race conditions when measuring and applying overlay; detection is debounced on resize.

## 4. Run Automated Tests to Verify
- [ ] Run unit snapshots and Playwright measurement tests (Chromium) to confirm measured width near 8px and fallbacks present for overlay platforms.

## 5. Update Documentation
- [ ] Add `docs/ui/scrollbars.md` describing `.scrollbar-slim` usage, cross-platform caveats, the fallback overlay behavior, and how to test it locally with Playwright.

## 6. Automated Verification
- [ ] CI script `tests/ci_scrollbar_check.js` runs Playwright to render an overflow page and asserts either computed scrollbar width ≈ 8px or presence of accessible overlay track; fail CI on mismatch.