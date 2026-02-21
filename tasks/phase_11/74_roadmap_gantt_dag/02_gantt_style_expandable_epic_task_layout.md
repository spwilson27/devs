# Task: Gantt-Style Expandable Epic & Task Layout (Sub-Epic: 74_Roadmap_Gantt_DAG)

## Covered Requirements
- [4_USER_FEATURES-REQ-033]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/views/RoadmapView/`, create `GanttView.test.tsx`.
- [ ] Write a unit test asserting that `<GanttView />` renders a Gantt-style horizontal timeline with one row per epic when provided 8-16 epics.
- [ ] Write a unit test asserting that each epic row is initially collapsed, displaying only the epic name and a duration bar.
- [ ] Write a unit test asserting that clicking an epic row expands it to reveal one sub-row per constituent task, each with a proportionally-sized duration bar.
- [ ] Write a unit test asserting that a "View Mode" toggle button (`DAG | Gantt`) switches between the `<DagCanvas />` and `<GanttView />` sub-components within `<RoadmapView />`.
- [ ] Write an accessibility test confirming that each epic row has `role="row"`, each cell has `role="gridcell"`, and the expand button has `aria-expanded` set correctly.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/views/RoadmapView/GanttView.tsx` as the Gantt layout sub-component.
- [ ] Define a `GanttRow` type in `types.ts`: `{ id: string, title: string, startPhase: number, endPhase: number, type: 'epic' | 'task', epicId?: string, status: TaskStatus }`.
- [ ] Implement `useGanttRows` hook in `useGanttRows.ts` that:
  - Consumes `epics` and `tasks` from the Zustand project mirror store.
  - Derives a sorted `GanttRow[]` list with epics first, each followed by their tasks (when expanded).
  - Manages a `Set<string>` of expanded epic IDs in Zustand Tier-1 state.
- [ ] Implement `<GanttView />` rendering a CSS Grid layout where:
  - Column 1 (fixed 200px): Epic/Task label column.
  - Columns 2–N (flexible): Timeline columns representing project phases (1–16).
  - Each `GanttRow` renders a `<GanttBar />` component spanning from `startPhase` to `endPhase`.
- [ ] Implement `<GanttBar />` in `GanttBar.tsx`:
  - Renders a colored `<div>` whose width is determined by `(endPhase - startPhase) / totalPhases * 100%`.
  - Color derives from status: PENDING (`--vscode-charts-lines`), RUNNING (`--vscode-charts-blue`), SUCCESS (`--vscode-charts-green`), FAILED (`--vscode-charts-red`).
  - For epic bars, use a semi-transparent overlay of the task bar colors using `color-mix()`.
- [ ] Add a "View Mode" toggle button in `RoadmapView.tsx` (above the canvas) with two states: `DAG` and `Gantt`. Persist the selected mode to Zustand Tier-1.
- [ ] Implement keyboard support: `Up`/`Down` arrow keys navigate between rows; `Space` or `Enter` toggles epic expansion; `Tab` shifts focus to the Directive input field.
- [ ] Ensure all interactive epic rows have `role="row"`, `aria-expanded`, and `aria-label` attributes populated from the epic title.

## 3. Code Review
- [ ] Verify `GanttView` uses CSS Grid (not absolute positioning) so it responds correctly to viewport resizes.
- [ ] Verify that `GanttBar` color is computed exclusively from VSCode CSS variables using `color-mix()` — no hardcoded hex values.
- [ ] Verify that the expanded state of each epic is stored in Zustand Tier-1 (volatile) state, not component local state, so state persists across view navigations.
- [ ] Verify keyboard navigation is fully functional and does not conflict with VSCode's own keyboard handlers (use `e.stopPropagation()` only within the Gantt grid container).
- [ ] Verify the "View Mode" toggle uses a `<vscode-button>` component from `@vscode/webview-ui-toolkit` and displays the active mode with the `appearance="primary"` attribute.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="GanttView"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode build` to confirm no TypeScript compilation errors.

## 5. Update Documentation
- [ ] Create `packages/vscode/src/webview/views/RoadmapView/GanttView.agent.md` documenting: intent (Gantt-style timeline for epics/tasks), hooks consumed (`useGanttRows`, `useProjectStore`), keyboard interactions, and test strategy.
- [ ] Update `RoadmapView.agent.md` to document the view mode toggle and relationship between `GanttView` and `DagCanvas`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="GanttView"` and assert line coverage for `GanttView.tsx` and `GanttBar.tsx` is ≥ 80%.
- [ ] Run an axe-core accessibility audit within the test suite targeting the rendered `<GanttView />` and confirm zero critical or serious violations.
- [ ] Confirm `role="row"` and `aria-expanded` attributes are present in the rendered DOM by inspecting test output from `@testing-library/react`'s `getByRole('row')` query.
