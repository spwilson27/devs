# Task: High Contrast Theme Detection & CSS Variable Override System (Sub-Epic: 87_Contrast_Risk_Resilience)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-141], [4_USER_FEATURES-REQ-047]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/__tests__/useHighContrastMode.test.ts`, write unit tests for a `useHighContrastMode()` React hook:
  - Test that it returns `false` when `document.body.classList` does NOT contain `vscode-high-contrast` or `vscode-high-contrast-light`.
  - Test that it returns `true` when `document.body.classList` contains `vscode-high-contrast`.
  - Test that it returns `true` when `document.body.classList` contains `vscode-high-contrast-light`.
  - Test that it reacts to a `MutationObserver` callback when the body class changes from standard to high-contrast at runtime (simulate a class mutation).
  - Test cleanup: verify the `MutationObserver` is disconnected when the hook unmounts.
- [ ] In `packages/vscode/src/webview/__tests__/HighContrastProvider.test.tsx`, write integration tests for a `<HighContrastProvider>` React context provider:
  - Test that child components receive `isHighContrast: true` via context when the body has `vscode-high-contrast` class.
  - Test that `data-high-contrast="true"` is applied to the root element when HC is active.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/hooks/useHighContrastMode.ts`:
  - Use a `useEffect` to instantiate a `MutationObserver` watching `document.body` for `attributes` changes (`attributeFilter: ['class']`).
  - Derive HC state by checking `document.body.classList.contains('vscode-high-contrast') || document.body.classList.contains('vscode-high-contrast-light')`.
  - Initialize state synchronously before the observer fires to avoid a flash of incorrect state.
  - Return `isHighContrast: boolean`.
- [ ] Create `packages/vscode/src/webview/providers/HighContrastProvider.tsx`:
  - Create a `React.createContext<{ isHighContrast: boolean }>` with default `{ isHighContrast: false }`.
  - In the provider, call `useHighContrastMode()` and pass the value to the context.
  - Apply `data-high-contrast={String(isHighContrast)}` to the root `<div>` wrapper so CSS attribute selectors can target it globally.
  - Export `useHighContrastContext()` convenience hook.
- [ ] Wrap the Webview root (`packages/vscode/src/webview/App.tsx`) with `<HighContrastProvider>` at the outermost level, inside the Zustand store provider.

## 3. Code Review
- [ ] Verify the `MutationObserver` is properly cleaned up in the `useEffect` return function to prevent memory leaks.
- [ ] Confirm no hardcoded color values are introduced; the hook is purely behavioral (detection only).
- [ ] Confirm the context default value is `false` so SSR/test environments don't break.
- [ ] Verify `data-high-contrast` attribute toggling happens on the top-level container, not on individual leaf components.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="useHighContrastMode|HighContrastProvider"` and confirm all tests pass with zero failures.

## 5. Update Documentation
- [ ] Add a note to `packages/vscode/ARCHITECTURE.md` (or create it if absent) under a "Theme & Accessibility" section describing the `HighContrastProvider` pattern, how it detects VSCode HC themes, and the `data-high-contrast` attribute convention used for CSS targeting.
- [ ] Update `specs/7_ui_ux_design.md` agent memory notes (if a `memory/` directory exists) to record that HC detection is centralized in `HighContrastProvider`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test --coverage -- --testPathPattern="useHighContrastMode|HighContrastProvider"` and assert coverage ≥ 90% for the two new files.
- [ ] Run `pnpm --filter @devs/vscode build` to confirm the TypeScript compilation succeeds with no new type errors.
