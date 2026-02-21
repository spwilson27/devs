# Task: Implement Manual LOD Toggle Control to Mitigate Dashboard Fatigue (Sub-Epic: 71_Massive_Graph_LOD)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-RISK-001], [6_UI_UX_ARCH-REQ-048]

## 1. Initial Test Written
- [ ] In `packages/ui/src/components/__tests__/LodToggle.test.tsx`, write tests for the `<LodToggle>` toolbar control component:
  - Test: Renders a button with `data-testid="lod-toggle-btn"` and Codicon `codicon-layers` icon.
  - Test: Button `aria-label` is `"Toggle Level of Detail"`.
  - Test: When `userLodPreference` in Zustand store is `"AUTO"`, button tooltip text is `"LOD: Auto"`.
  - Test: Clicking the button cycles through `"AUTO"` → `"COLLAPSED"` → `"AUTO"` (two states).
  - Test: When `userLodPreference === "COLLAPSED"`, the Zustand store's `activeRenderMode` is overridden to `"EPIC_SUMMARY"` regardless of epic count or task count.
  - Test: When `userLodPreference === "AUTO"`, `activeRenderMode` is determined by automatic thresholds (restored to computed value).
  - Test: The toggle button state is persisted to Tier 3 (persistent user preferences) in the Zustand store so it survives webview reload.
- [ ] In `packages/ui/src/store/__tests__/dagLodStore.userToggle.test.ts`:
  - Test: `setUserLodPreference("COLLAPSED")` causes `activeRenderMode` to be `"EPIC_SUMMARY"` even if `epicCount <= 10` and `taskCount <= 300`.
  - Test: `setUserLodPreference("AUTO")` restores `activeRenderMode` to the value computed from `epicCount` and `taskCount`.

## 2. Task Implementation
- [ ] Add `userLodPreference: 'AUTO' | 'COLLAPSED'` and `setUserLodPreference(pref: 'AUTO' | 'COLLAPSED'): void` to `dagLodSlice.ts`.
- [ ] Update the `activeRenderMode` derivation logic in `dagLodSlice.ts`:
  ```ts
  // Priority order:
  // 1. If userLodPreference === "COLLAPSED" → "EPIC_SUMMARY"
  // 2. Else if forcedLodActive → "LOD_FORCED"
  // 3. Else if lodMode === "EPIC_SUMMARY" → "EPIC_SUMMARY"
  // 4. Else → "FULL"
  ```
- [ ] Persist `userLodPreference` to Tier 3 storage (VSCode `vscode.getState` / `vscode.setState`) via the existing persistence middleware in `packages/ui/src/store/persistenceMiddleware.ts`. Add `"userLodPreference"` to the `PERSISTED_KEYS` array.
- [ ] Create `packages/ui/src/components/DAGCanvas/LodToggle.tsx`:
  ```tsx
  // A compact toolbar button positioned in the DAGCanvas toolbar row.
  // Uses <i className="codicon codicon-layers"> as the icon.
  // Renders a tooltip via the shared <Tooltip> component showing "LOD: Auto" or "LOD: Collapsed".
  // On click, calls setUserLodPreference toggle.
  // Applies --vscode-button-secondaryBackground when active (COLLAPSED) to provide visual feedback.
  ```
- [ ] Mount `<LodToggle>` inside the `DAGCanvas` toolbar (the existing `<div className="dag-toolbar">` element) to the right of the existing zoom controls.
- [ ] Add a visible status indicator: when `userLodPreference === "COLLAPSED"`, render a small amber dot (`width: 6px, height: 6px, border-radius: 50%, background: --vscode-charts-yellow`) overlaid on the `codicon-layers` icon using CSS `position: absolute`.

## 3. Code Review
- [ ] Confirm `userLodPreference` persists correctly: simulate a webview reload by calling `vscode.getState()` in the persistence middleware test and verifying the preference is restored.
- [ ] Verify `setUserLodPreference` is the only way to mutate `userLodPreference`; no other action should modify it directly.
- [ ] Confirm `LodToggle` component uses `role="button"` and `aria-pressed` attribute (`aria-pressed={userLodPreference === "COLLAPSED"}`) for accessibility.
- [ ] Verify the amber status dot uses `--vscode-charts-yellow` (not a hardcoded hex) for the theme-aware color.
- [ ] Confirm the Codicon class is `codicon codicon-layers` and not a custom SVG icon (per REQ-UI-DES-005-2 / REQ-UI-DES-064-6 Codicon utilization requirement).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui test -- --testPathPattern=LodToggle` and confirm all 7 component tests pass.
- [ ] Run `pnpm --filter @devs/ui test -- --testPathPattern=dagLodStore.userToggle` and confirm all 2 store tests pass.
- [ ] Run `pnpm --filter @devs/ui test` (full suite) and confirm no regressions.

## 5. Update Documentation
- [ ] Add a `### LOD User Toggle` section to `packages/ui/docs/dag-canvas.md` documenting: the two states (`AUTO`, `COLLAPSED`), priority order for `activeRenderMode` derivation, and persistence behavior (Tier 3 via `vscode.getState`/`setState`).
- [ ] Update `docs/agent-memory/phase_11_decisions.md` with: "LOD user toggle: 2 states (AUTO/COLLAPSED). COLLAPSED forces EPIC_SUMMARY mode. Persisted to Tier 3 (VSCode state). Priority: userPref > forcedLod > autothresholds."
- [ ] Update the UX risk register in `docs/risks.md` (or equivalent) with a note: "REQ-UI-RISK-001 (Dashboard Fatigue) mitigated by `LodToggle` component allowing manual COLLAPSED mode."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/ui test:ci` and assert exit code `0`.
- [ ] Run `pnpm --filter @devs/ui build` and confirm zero TypeScript errors.
- [ ] Run `grep -n "aria-pressed" packages/ui/src/components/DAGCanvas/LodToggle.tsx` to confirm accessibility attribute is present.
- [ ] Run `grep -n "userLodPreference" packages/ui/src/store/persistenceMiddleware.ts` to confirm the key is in the `PERSISTED_KEYS` array.
- [ ] Run `grep -n "codicon-layers" packages/ui/src/components/DAGCanvas/LodToggle.tsx` to confirm the correct Codicon is used.
