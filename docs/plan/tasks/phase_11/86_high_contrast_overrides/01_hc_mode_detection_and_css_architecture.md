# Task: High-Contrast Mode Detection & CSS Override Architecture (Sub-Epic: 86_High_Contrast_Overrides)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-025]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/__tests__/hcMode.test.ts`, write unit tests that:
  - Verify a utility function `isHighContrastActive(document: Document): boolean` returns `true` when `document.body` has the class `vscode-high-contrast`, and `false` otherwise.
  - Verify that when `isHighContrastActive` returns `true`, a React context value `HighContrastContext` exposes `{ isHighContrast: true }`.
  - Verify that the `<HighContrastProvider>` component adds a `data-hc="true"` attribute to its root DOM node when HC is active, enabling CSS cascade targeting.
- [ ] In `packages/vscode/src/webview/__tests__/hcOverridesLayer.test.ts`, write integration tests (using jsdom + `@testing-library/react`) that:
  - Mount the app root inside a container that has the `vscode-high-contrast` class and assert that the computed style of a known UI element (e.g., `.devs-card`) reflects the HC override CSS variables (specifically that `--devs-hc-active` is `1`).
  - Mount the app root without the class and assert `--devs-hc-active` is `0` or absent.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/context/HighContrastContext.tsx`:
  - Export a `React.Context<{ isHighContrast: boolean }>` defaulting to `{ isHighContrast: false }`.
  - Export a `HighContrastProvider` component that:
    1. Reads `document.body.classList.contains('vscode-high-contrast')` on mount.
    2. Subscribes to a `MutationObserver` on `document.body` watching `attributes` (specifically `class`) to reactively detect theme switches at runtime.
    3. Cleans up the observer on unmount.
    4. Sets `data-hc="true"` on its root `<div>` wrapper when HC is active.
    5. Provides the context value `{ isHighContrast }` to children.
- [ ] Create `packages/vscode/src/webview/styles/hc-overrides.css`:
  - Define a CSS layer `@layer devs.hc-overrides` to ensure overrides cascade above the base token layer.
  - Within a `.vscode-high-contrast [data-hc="true"], .vscode-high-contrast` selector block, define the CSS custom property `--devs-hc-active: 1;` to act as a boolean flag usable in `@supports` or conditional expressions.
  - Document the file header with: `/* HC Override Layer: activated when .vscode-high-contrast is present on <body>. See REQ-UI-DES-025. */`
- [ ] Import `hc-overrides.css` into the Webview entrypoint (`packages/vscode/src/webview/index.tsx`) after the base Tailwind/token CSS import.
- [ ] Wrap the app root in `<HighContrastProvider>` in `packages/vscode/src/webview/App.tsx`.
- [ ] Export a convenience hook `useHighContrast(): boolean` from `packages/vscode/src/webview/context/HighContrastContext.tsx`.

## 3. Code Review
- [ ] Confirm the `MutationObserver` is correctly disconnected in the cleanup function (`useEffect` return) to prevent memory leaks.
- [ ] Confirm no hardcoded color values exist in `hc-overrides.css`; all values must reference `var(--vscode-*)` tokens.
- [ ] Confirm the CSS layer order is declared correctly so `devs.hc-overrides` overrides `devs.base-tokens`.
- [ ] Confirm `HighContrastProvider` is a pure structural component with no visual rendering of its own (renders a single `<div>` or `<React.Fragment>` only).
- [ ] Confirm the `isHighContrastActive` utility is a pure function with zero side effects and is independently testable.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="hcMode|hcOverridesLayer"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode build` to confirm the Webview bundle compiles without TypeScript or CSS errors.

## 5. Update Documentation
- [ ] Add a section `## High-Contrast Mode` to `packages/vscode/ARCHITECTURE.md` describing: the `HighContrastProvider`, the `.vscode-high-contrast` detection strategy, and the CSS layer override approach.
- [ ] Add `useHighContrast` to the agent memory file `docs/agent-memory/ui-hooks.md` with a one-line description: "Returns `true` when VSCode is in a High Contrast theme."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="hcMode|hcOverridesLayer"` and confirm `HighContrastContext.tsx` and `hc-overrides.css` both appear in the coverage report with ≥ 90% statement coverage.
- [ ] Run `grep -r "color-mix" packages/vscode/src/webview/styles/hc-overrides.css` and confirm the output is empty (no `color-mix()` calls exist in the override layer itself).
