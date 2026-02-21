# Task: Define Layout Modes Engine and Config (Sub-Epic: 37_Layout_Modes_Scaling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-062-2], [7_UI_UX_DESIGN-REQ-UI-DES-062-3]

## 1. Initial Test Written
- [ ] Add unit tests at packages/ui/src/__tests__/layoutModes.spec.ts (Vitest/Jest):
  - Assert the exported TypeScript type `LayoutMode` includes 'standard' and 'wide'.
  - Test `getLayoutConfiguration(mode, containerWidth)` returns an object with `columns: string` and `panePercentages: number[]` where:
    - For 'standard' the string equals `"25% 75%"` and panePercentages equals `[25,75]`.
    - For 'wide' the returned columns string contains three percentages and the center percentage is >= 50% (e.g., `[20,60,20]`).
  - Test `useLayoutMode`/`switchLayoutMode` updates the Zustand `layout.mode` slice and emits a `LAYOUT_MODE_CHANGED` event (stub an event-bus or postMessage).
  - Add a snapshot test for the generated CSS classnames / inline style keys for both modes.

## 2. Task Implementation
- [ ] Implement a small, focused module at `packages/ui/src/layout/layoutModes.ts`:
  - Export `type LayoutMode = 'standard' | 'wide';` and constants for default percentages: `STANDARD = [25,75]`, `WIDE = [20,60,20]`.
  - Implement `getLayoutConfiguration(mode: LayoutMode, containerWidth?: number): { columns: string; panePercentages: number[] }` which returns an exact `grid-template-columns` string (percentages with `%`) and the numeric array.
  - Implement `useLayoutMode()` hook and a Zustand slice `layout` with `{ mode, setMode }` and a `switchLayoutMode(mode)` helper that persists to `localStorage` and calls `vscode.getState()` when running inside the webview environment (guard references to `vscode` behind a runtime check).
  - Implement `LayoutProvider` and `LayoutContext` components that apply the inline `style={{ gridTemplateColumns: columns }}` computed from `getLayoutConfiguration` and expose `mode` and `setMode` to children.
  - Add minimal CSS utility fallbacks `.layout-mode-standard` and `.layout-mode-wide` in `packages/ui/src/styles/layout-modes.css` but prefer inline grid style for pixel-perfect control.
  - Add JSDoc comments and TypeScript definitions; export the module from the package entrypoint.

## 3. Code Review
- [ ] Verify the implementation satisfies:
  - Pure function `getLayoutConfiguration` with no DOM access and full TypeScript coverage.
  - Clear, small public API surface and no accidental global side-effects; all persistence must be guarded behind environment checks.
  - Tests cover edge cases (unknown mode) and snapshots exist for both modes.

## 4. Run Automated Tests to Verify
- [ ] Execute UI package tests (for the monorepo: `pnpm -w --filter @devs/ui test` or from package: `npm test`).
  - Confirm `layoutModes.spec.ts` passes and coverage for `layoutModes.ts` >= 90%.

## 5. Update Documentation
- [ ] Add `docs/ui/layout-modes.md` describing the mode definitions, the exact percentages used (Standard: 25/75, Wide: 20/60/20), example usage of `LayoutProvider`, and a small mermaid diagram showing the two layouts.

## 6. Automated Verification
- [ ] Add a small node script `scripts/verify_layout_modes.js` used by CI that imports `getLayoutConfiguration` and asserts exact string equality for `columns` and exact numeric arrays for `panePercentages` for both modes; ensure CI runs this script as part of `test:fast`.
