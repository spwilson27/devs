# Task: Implement LOD Toggle System for Dashboard Fatigue Mitigation (Sub-Epic: 97_Diagnostics_RCA_Metrics)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-008]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/__tests__/LodToggle.test.tsx`, write unit tests for a `LodToggle` React component:
  - Test that the component renders a toggle button with an accessible label (e.g., `aria-label="Toggle detail level"`).
  - Test that clicking the button cycles through three LOD levels: `FULL`, `SUMMARY`, and `MINIMAL`.
  - Test that the current LOD level is exposed via a data attribute (e.g., `data-lod="FULL"`) for automated agent screenshot-parsing.
  - Test that the component emits an `onLodChange(level: 'FULL' | 'SUMMARY' | 'MINIMAL')` callback when toggled.
- [ ] In `packages/vscode/src/webview/store/__tests__/uiStore.lod.test.ts`, write unit tests for the Zustand store slice:
  - Test that `uiStore` has an initial `lodLevel` state of `'FULL'`.
  - Test that `setLodLevel(level)` correctly updates `lodLevel` in the store.
  - Test that subscribing selectors only trigger re-renders when `lodLevel` changes (selector isolation).
- [ ] In `packages/vscode/src/webview/components/__tests__/TelemetryPanel.lod.test.tsx`, write integration tests for the `TelemetryPanel` component:
  - Test that when `lodLevel` is `'MINIMAL'`, the telemetry sub-components (`FlamegraphView`, `HeapSnapshotView`, metric sparklines) are not rendered (returns `null` or a collapsed placeholder).
  - Test that when `lodLevel` is `'SUMMARY'`, only high-level metric badges (token count, phase, status) are visible, and the detailed panels are hidden.
  - Test that when `lodLevel` is `'FULL'`, all telemetry components are rendered.
- [ ] In `packages/vscode/src/webview/components/__tests__/HealthZone.lod.test.tsx`, write integration tests:
  - Test that the `HealthZone` (fixed header bar) always shows the `LodToggle` button regardless of LOD state.
  - Test that state is persisted to `vscode.setState` when LOD changes, so it survives webview reloads.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/components/LodToggle.tsx`:
  - A React functional component accepting `{ lodLevel, onLodChange }` props.
  - Render a VSCode Codicon button (`$(layers)` icon) that cycles LOD on click.
  - Apply `data-lod={lodLevel}` to the root element.
  - Include `aria-label` and `title` attributes describing the current level.
  - Use only `--vscode-*` CSS tokens; no hardcoded colors.
- [ ] Add `lodLevel` state and `setLodLevel` action to the Zustand UI store in `packages/vscode/src/webview/store/uiStore.ts`:
  - `lodLevel: 'FULL' | 'SUMMARY' | 'MINIMAL'` initialized to `'FULL'`.
  - `setLodLevel: (level) => void` action.
  - Persist `lodLevel` to `vscode.setState` inside the action using the existing `vscode` API handle.
  - On store initialization, read `vscode.getState()?.lodLevel` and seed the initial state from it.
- [ ] Update `packages/vscode/src/webview/components/TelemetryPanel.tsx`:
  - Subscribe to `uiStore` `lodLevel` via a selector.
  - When `lodLevel === 'MINIMAL'`: render only a single-line collapsed bar with the text "Telemetry hidden — LOD: MINIMAL".
  - When `lodLevel === 'SUMMARY'`: render only `MetricBadge` components (token count, task status, phase). Hide `FlamegraphView` and `HeapSnapshotView`.
  - When `lodLevel === 'FULL'`: render all sub-components.
  - Wrap conditional rendering in `React.memo` to prevent unnecessary re-renders.
- [ ] Update `packages/vscode/src/webview/components/HealthZone.tsx`:
  - Import and render `LodToggle` in the top-right action group of the fixed health bar.
  - Wire `onLodChange` to `uiStore.setLodLevel`.
  - Ensure `LodToggle` is always visible regardless of current view (DASHBOARD, ROADMAP, CONSOLE, etc.).

## 3. Code Review
- [ ] Verify `LodToggle` uses only VSCode design tokens (no raw hex/rgb values).
- [ ] Verify `uiStore` selector for `lodLevel` does not cause spurious re-renders in unrelated components (run React DevTools Profiler or equivalent).
- [ ] Verify `TelemetryPanel` is wrapped with `React.memo` and its LOD-conditional branches use early returns rather than CSS `display:none` (components must not mount when hidden at `MINIMAL`/`SUMMARY`).
- [ ] Verify `vscode.getState` seeding occurs before the first render to prevent a flash of default state.
- [ ] Verify `LodToggle` meets minimum interactive target size (24×24px) per `[7_UI_UX_DESIGN-REQ-UI-DES-048-1]`.
- [ ] Verify the `data-lod` attribute is present on the toggle root for agent screenshot-parsing compatibility per `[7_UI_UX_DESIGN-REQ-UI-DES-007]`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="LodToggle|TelemetryPanel.lod|HealthZone.lod|uiStore.lod"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm no TypeScript compilation errors.

## 5. Update Documentation
- [ ] Update `packages/vscode/src/webview/store/uiStore.ts` JSDoc to document the `lodLevel` state and its effect on visible components.
- [ ] Update `docs/ui-architecture.md` (or equivalent agent memory file) with a note: "LOD toggle persists to `vscode.getState`. Three levels: FULL (all telemetry visible), SUMMARY (badges only), MINIMAL (telemetry collapsed). Controlled via `HealthZone > LodToggle`. Requirement: `[7_UI_UX_DESIGN-REQ-UI-DES-008]`."
- [ ] Add an entry to `CHANGELOG.md` under the Phase 11 section: "feat(vscode): Add LOD toggle to HealthZone for dashboard fatigue mitigation".

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="LodToggle|TelemetryPanel.lod|HealthZone.lod|uiStore.lod" --json --outputFile=/tmp/lod_test_results.json` and assert `numFailedTests === 0` in the JSON output.
- [ ] Run `grep -r "hardcoded\|#[0-9a-fA-F]\{3,6\}\|rgb(" packages/vscode/src/webview/components/LodToggle.tsx` and assert no matches (no hardcoded colors).
- [ ] Run `grep "data-lod" packages/vscode/src/webview/components/LodToggle.tsx` and assert at least one match confirming the agent-parseable attribute is present.
