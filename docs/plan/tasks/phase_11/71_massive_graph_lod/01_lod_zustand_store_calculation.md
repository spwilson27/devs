# Task: Implement DAG LOD Calculation Logic in Zustand Store (Sub-Epic: 71_Massive_Graph_LOD)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-048], [6_UI_UX_ARCH-REQ-025]

## 1. Initial Test Written
- [ ] In `packages/ui/src/store/__tests__/dagLodStore.test.ts`, write unit tests for the Zustand store slice responsible for LOD calculation:
  - Test: When `epicCount <= 10`, `lodMode` is `"FULL"` and `epicSummaryDag` is `null`.
  - Test: When `epicCount > 10`, `lodMode` is `"EPIC_SUMMARY"` and `epicSummaryDag` is a non-null array of `EpicSummaryNode` objects (each containing `epicId`, `epicTitle`, `taskCount`, `completedCount`, `progressPercent`).
  - Test: When `taskCount > 300`, `forcedLodActive` flag is `true` and the store's `activeRenderMode` is `"LOD_FORCED"`.
  - Test: When `taskCount` drops back to ≤ 300 (simulated via `setProjectData`), `forcedLodActive` returns to `false`.
  - Test: `epicSummaryDag` is recalculated (selector re-runs) only when `epics` or `tasks` array references change — verify memoization by checking the selector returns the same object reference on unchanged input.
  - Test: `drillDownEpicId` defaults to `null`; when `setDrillDownEpic(epicId)` is called, the full task-level DAG for that Epic is computed and exposed as `drillDownDag`.

## 2. Task Implementation
- [ ] In `packages/ui/src/store/dagLodSlice.ts`, define the Zustand slice:
  ```ts
  interface DagLodState {
    lodMode: 'FULL' | 'EPIC_SUMMARY';
    forcedLodActive: boolean;
    activeRenderMode: 'FULL' | 'LOD_FORCED' | 'EPIC_SUMMARY';
    epicSummaryDag: EpicSummaryNode[] | null;
    drillDownEpicId: string | null;
    drillDownDag: TaskNode[] | null;
  }
  ```
- [ ] Add `EpicSummaryNode` type to `packages/ui/src/types/dag.ts`:
  ```ts
  interface EpicSummaryNode {
    epicId: string;
    epicTitle: string;
    taskCount: number;
    completedCount: number;
    progressPercent: number; // 0–100, rounded to 1 decimal
  }
  ```
- [ ] Implement `computeEpicSummaryDag(epics, tasks): EpicSummaryNode[]` as a pure function in `packages/ui/src/store/dagLodSelectors.ts`. It groups tasks by `epicId`, counts total and completed, and calculates `progressPercent`.
- [ ] In the slice's `setProjectData(epics, tasks)` action:
  - Set `lodMode` to `"EPIC_SUMMARY"` if `epics.length > 10`, else `"FULL"`.
  - Set `forcedLodActive` to `true` if `tasks.length > 300`, else `false`.
  - Derive `activeRenderMode`: if `forcedLodActive`, use `"LOD_FORCED"`; else if `lodMode === "EPIC_SUMMARY"`, use `"EPIC_SUMMARY"`; else `"FULL"`.
  - Call `computeEpicSummaryDag` and store result in `epicSummaryDag` (or `null` if not needed).
- [ ] Implement `setDrillDownEpic(epicId: string | null)` action: filters `tasks` for the given `epicId` and computes the full task-level `TaskNode[]` DAG for `drillDownDag`. If `epicId` is `null`, clears `drillDownDag`.
- [ ] Register `dagLodSlice` in the root Zustand store at `packages/ui/src/store/index.ts` via `create(combine(...slices))`.

## 3. Code Review
- [ ] Verify `computeEpicSummaryDag` is a pure function with no side effects and is independently unit-testable.
- [ ] Confirm the slice uses Zustand's `immer` middleware if other slices do, maintaining consistency.
- [ ] Confirm `activeRenderMode` is derived deterministically from `lodMode` and `forcedLodActive` — no direct mutation should set it independently.
- [ ] Verify no raw hex colors or hardcoded strings for epic titles are present; all data flows from the store's `setProjectData` input.
- [ ] Ensure `drillDownDag` computation handles edge cases: epic with zero tasks, epic not found in tasks list.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui test -- --testPathPattern=dagLodStore` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/ui test -- --coverage --testPathPattern=dagLodStore` and verify line coverage ≥ 95% for `dagLodSlice.ts` and `dagLodSelectors.ts`.

## 5. Update Documentation
- [ ] Add a `## DAG LOD Store Slice` section to `packages/ui/docs/state-management.md` describing `DagLodState` shape, `setProjectData` action contract, thresholds (>10 epics → EPIC_SUMMARY, >300 tasks → LOD_FORCED), and `drillDownEpicId` drill-down pattern.
- [ ] Add inline JSDoc to `computeEpicSummaryDag` describing inputs, output shape, and memoization contract.
- [ ] Update the agent memory file `docs/agent-memory/phase_11_decisions.md` with the entry: "LOD store thresholds: >10 epics → EPIC_SUMMARY mode; >300 tasks → LOD_FORCED override."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/ui test:ci` (CI test script) and assert exit code is `0`.
- [ ] Run `pnpm --filter @devs/ui build` to confirm TypeScript compilation succeeds with no type errors in the new slice and selector files.
- [ ] Execute `grep -rn "computeEpicSummaryDag" packages/ui/src/store/dagLodSelectors.ts` to confirm the function exists in the correct module.
