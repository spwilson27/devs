# Task: Implement Focus Ring CSS — Standard & High-Contrast Offset (Sub-Epic: 89_Focus_Keyboard_Control)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-084-2]

## 1. Initial Test Written

- [ ] In `packages/vscode/src/webview/styles/__tests__/focusRing.test.ts`, write the following tests using `jest-environment-jsdom` with CSS custom property mocking:
  - **Standard focus ring present**: Inject a test DOM element (`<button class="devs-interactive">`) into the jsdom environment. Set `--vscode-focusBorder` to `#007fd4` via `document.documentElement.style.setProperty(...)`. Assert via `getComputedStyle` (or a snapshot of the CSS text) that the `:focus-visible` rule applies `outline: 2px solid var(--vscode-focusBorder)` and `outline-offset: 0px`.
  - **HC mode offset**: Set `forced-colors: active` media query simulation (using `window.matchMedia` mock). Assert that the `:focus-visible` rule's `outline-offset` becomes `2px` in the HC stylesheet override block.
  - **No outline suppression**: Grep the entire CSS output / Tailwind purge result for `outline: none` or `outline: 0` without an accompanying `:focus-visible` replacement and assert zero matches.
  - **Applies to all interactive selectors**: Assert the focus-ring rule targets at minimum: `button`, `[role="button"]`, `[role="option"]`, `[role="treeitem"]`, `a[href]`, `input`, `select`, `textarea`, `[tabindex]:not([tabindex="-1"])`.

- [ ] In `packages/vscode/src/webview/components/__tests__/FocusRingIntegration.test.tsx`, write an integration test:
  - Render `<TaskCard />` and `<DAGCanvas />` in a jsdom environment, focus each interactive element, and assert `document.activeElement` receives the CSS class or inline style that matches the focus ring contract (use a helper that reads the element's effective `:focus-visible` styles via `getComputedStyle`).

## 2. Task Implementation

- [ ] Create `packages/vscode/src/webview/styles/focus-ring.css` with the following content:
  ```css
  /* [7_UI_UX_DESIGN-REQ-UI-DES-084-2]: Focus ring persistence */

  /* --- Standard focus ring --- */
  :focus-visible {
    outline: 2px solid var(--vscode-focusBorder);
    outline-offset: 0px;
  }

  /* --- High Contrast mode: offset by 2px so ring is not masked by component border --- */
  @media (forced-colors: active) {
    :focus-visible {
      outline: 2px solid ButtonText;
      outline-offset: 2px;
    }
  }

  /* --- Explicit opt-in class for non-native-interactive elements (role="button" divs, SVG groups) --- */
  .devs-focusable:focus-visible {
    outline: 2px solid var(--vscode-focusBorder);
    outline-offset: 0px;
  }

  @media (forced-colors: active) {
    .devs-focusable:focus-visible {
      outline: 2px solid ButtonText;
      outline-offset: 2px;
    }
  }

  /* --- Ensure no component resets suppress the ring --- */
  *:focus:not(:focus-visible) {
    outline: none; /* suppress mouse-click ring, but NEVER remove :focus-visible ring */
  }
  ```
- [ ] Import `focus-ring.css` in the Webview's root stylesheet entry point (`packages/vscode/src/webview/styles/index.css` or equivalent), ensuring it is loaded before any Tailwind utility classes.
- [ ] Audit `tailwind.config.js` (or `tailwind.config.ts`) in the vscode package:
  - Add `ring-color: { DEFAULT: 'var(--vscode-focusBorder)' }` to the theme if Tailwind ring utilities are used for focus.
  - Add the Tailwind `focus-visible` variant plugin if not already present.
- [ ] Scan all existing component files under `packages/vscode/src/webview/components/` for instances of `outline: none`, `outline: 0`, or Tailwind's `outline-none` class applied globally or without a `:focus-visible` guard. Replace with `focus:outline-none focus-visible:outline-[2px] focus-visible:outline-[var(--vscode-focusBorder)]` (Tailwind) or remove the suppression.
- [ ] For SVG node elements in `DAGCanvas.tsx` that cannot use CSS `:focus-visible` directly (SVG elements), add the `devs-focusable` class to their wrapping `<g>` or `<foreignObject>` element so the CSS class-based rule applies.

## 3. Code Review

- [ ] Verify `focus-ring.css` is NOT scoped inside a Shadow DOM boundary that would prevent it from reaching SVG or Webview root elements — or, if Shadow DOM isolation is used, verify the styles are injected into the correct shadow root.
- [ ] Verify the `@media (forced-colors: active)` block uses `ButtonText` (a CSS system color keyword) rather than a hardcoded hex value, ensuring OS-level forced-color palette compliance.
- [ ] Verify `*:focus:not(:focus-visible) { outline: none }` does not unintentionally suppress focus rings in browsers that do not support `:focus-visible` (add a note: in that case, the `:focus` rule without `:focus-visible` guard must be used as a fallback).
- [ ] Verify no Tailwind JIT purge removes the focus-ring CSS because the file is outside the `content` glob — add `packages/vscode/src/webview/styles/focus-ring.css` to the Tailwind content array if it contains class names.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=focusRing` from the monorepo root.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=FocusRingIntegration`.
- [ ] All new tests MUST pass with zero failures.
- [ ] Run the full webview test suite: `pnpm --filter @devs/vscode test` and confirm no regressions.

## 5. Update Documentation

- [ ] Add a section "Focus Ring CSS Contract" to `docs/accessibility.md`:
  - Standard rule: `2px solid var(--vscode-focusBorder)`, offset `0px`.
  - HC override: `2px solid ButtonText`, offset `2px`.
  - Any new interactive component MUST NOT add `outline: none` without a paired `:focus-visible` replacement.
  - Reference: `[7_UI_UX_DESIGN-REQ-UI-DES-084-2]`.
- [ ] Note in `packages/vscode/src/webview/styles/focus-ring.css` file header the requirement ID it satisfies.

## 6. Automated Verification

- [ ] CI pipeline step: `pnpm --filter @devs/vscode test --ci --coverage` must cover both the standard and HC `@media` branches of `focus-ring.css`.
- [ ] Add a CI linting step using `stylelint` (configured with `stylelint-config-standard`) that flags `outline: none` / `outline: 0` not paired with `:focus-visible`. Run: `pnpm --filter @devs/vscode stylelint "src/webview/**/*.css"` and assert exit code 0.
- [ ] Run Playwright E2E test in both default and `--force-colors` (high-contrast simulation) modes: tab to a TaskCard and a DAG node, take a screenshot, and assert via visual diff that the focus ring is visible and the HC ring is offset from the component border.
