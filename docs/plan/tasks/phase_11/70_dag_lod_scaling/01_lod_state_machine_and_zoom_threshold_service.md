# Task: Implement LOD State Machine and Zoom Threshold Service (Sub-Epic: 70_DAG_LOD_Scaling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-083], [7_UI_UX_DESIGN-REQ-UI-DES-083-1]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/hooks/__tests__/useDagLod.test.ts`, write unit tests for a `useDagLod` hook:
  - Test that at zoom scale `>= 0.75` (close), the hook returns `LOD_LEVEL.LOD3_CLOSE`.
  - Test that at zoom scale `>= 0.35` and `< 0.75` (mid), the hook returns `LOD_LEVEL.LOD2_MID`.
  - Test that at zoom scale `< 0.35` (far), the hook returns `LOD_LEVEL.LOD1_FAR`.
  - Test that the hook re-derives the LOD level reactively when the zoom scale prop changes (verify state transitions between all three levels).
  - Test that an invalid or undefined zoom scale defaults to `LOD_LEVEL.LOD3_CLOSE`.
- [ ] In `packages/vscode/src/webview/services/__tests__/lodCalculator.test.ts`, write unit tests for a pure `calculateLodLevel(zoomScale: number): LodLevel` function:
  - Verify boundary values exactly at `0.35` and `0.75` map to the correct LOD level.
  - Verify values just below/above boundaries correctly cross the threshold.
  - Verify the function is pure (same input always produces same output, no side effects).
- [ ] In `packages/vscode/src/webview/stores/__tests__/dagStore.test.ts`, write unit tests verifying the Zustand DAG store:
  - Confirm a `currentLodLevel` slice exists and is initialized to `LOD_LEVEL.LOD3_CLOSE`.
  - Confirm an `updateZoomScale(scale: number)` action correctly derives and stores the new `currentLodLevel`.

## 2. Task Implementation
- [ ] Create the LOD level enum/const in `packages/vscode/src/webview/types/dag.ts`:
  ```typescript
  export const LOD_LEVEL = {
    LOD3_CLOSE: 'LOD3_CLOSE', // zoom >= 0.75
    LOD2_MID:   'LOD2_MID',   // zoom >= 0.35 && < 0.75
    LOD1_FAR:   'LOD1_FAR',   // zoom < 0.35
  } as const;
  export type LodLevel = typeof LOD_LEVEL[keyof typeof LOD_LEVEL];

  export const LOD_THRESHOLDS = {
    CLOSE: 0.75,
    MID:   0.35,
  } as const;
  ```
- [ ] Create the pure calculator service in `packages/vscode/src/webview/services/lodCalculator.ts`:
  ```typescript
  import { LOD_LEVEL, LOD_THRESHOLDS, LodLevel } from '../types/dag';

  export function calculateLodLevel(zoomScale: number): LodLevel {
    if (typeof zoomScale !== 'number' || isNaN(zoomScale) || zoomScale >= LOD_THRESHOLDS.CLOSE) {
      return LOD_LEVEL.LOD3_CLOSE;
    }
    if (zoomScale >= LOD_THRESHOLDS.MID) {
      return LOD_LEVEL.LOD2_MID;
    }
    return LOD_LEVEL.LOD1_FAR;
  }
  ```
- [ ] Add a `currentLodLevel` slice and `updateZoomScale` action to the Zustand DAG store in `packages/vscode/src/webview/stores/dagStore.ts`:
  - Import `calculateLodLevel` and `LodLevel` from the service and types.
  - Add `currentLodLevel: LodLevel` initialized to `LOD_LEVEL.LOD3_CLOSE`.
  - Add `updateZoomScale: (scale: number) => void` which calls `set({ currentLodLevel: calculateLodLevel(scale) })`.
- [ ] Create the `useDagLod` hook in `packages/vscode/src/webview/hooks/useDagLod.ts`:
  - Accept a `zoomScale: number` parameter from the `react-zoom-pan-pinch` transform state.
  - Call `calculateLodLevel(zoomScale)` and return the resulting `LodLevel` value.
  - Use `useMemo` to avoid recomputation on unrelated renders.
  - Also dispatch `updateZoomScale` to the Zustand store so global subscribers can react to LOD changes.
- [ ] Export all new types, services, and hooks from their respective barrel `index.ts` files.

## 3. Code Review
- [ ] Verify `calculateLodLevel` is a pure function with zero imports from React or Zustand — it must be testable without any DOM or React environment.
- [ ] Verify the `LOD_THRESHOLDS` constants are the single source of truth; no magic numbers appear in the hook or store.
- [ ] Verify the Zustand store action does not contain presentation logic — it must only call `calculateLodLevel` and update state.
- [ ] Verify the `useDagLod` hook uses `useMemo` with `[zoomScale]` as the dependency array to prevent unnecessary recalculations.
- [ ] Verify there are no circular imports between `types/dag.ts`, `services/lodCalculator.ts`, `stores/dagStore.ts`, and `hooks/useDagLod.ts`.
- [ ] Verify TypeScript strict mode is satisfied: no `any` types, full return type annotations on all exported functions.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="useDagLod|lodCalculator|dagStore"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode tsc --noEmit` to confirm no TypeScript compilation errors are introduced.

## 5. Update Documentation
- [ ] Add a `## LOD State Machine` section to `packages/vscode/src/webview/DAGCanvas.agent.md` (create the file if it does not exist) describing:
  - The three LOD levels and their zoom thresholds (`LOD3_CLOSE >= 0.75`, `LOD2_MID >= 0.35`, `LOD1_FAR < 0.35`).
  - The data-flow: `react-zoom-pan-pinch` scale → `useDagLod` hook → `calculateLodLevel` → Zustand `currentLodLevel`.
  - The rationale: prevents "Telemetry Noise" as defined in `7_UI_UX_DESIGN-REQ-UI-DES-083`.
- [ ] Update `packages/vscode/src/webview/types/dag.ts` with JSDoc comments on `LodLevel`, `LOD_LEVEL`, and `LOD_THRESHOLDS` explaining each level's visual contract.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="useDagLod|lodCalculator|dagStore"` and confirm line coverage for `lodCalculator.ts` is **100%** and for the LOD slice of `dagStore.ts` is **≥ 90%**.
- [ ] Run `grep -r "0\.75\|0\.35" packages/vscode/src/webview --include="*.ts" --include="*.tsx" -l` and confirm the only file containing these literal numbers is `packages/vscode/src/webview/types/dag.ts` (i.e., no magic numbers leaked into other files).
