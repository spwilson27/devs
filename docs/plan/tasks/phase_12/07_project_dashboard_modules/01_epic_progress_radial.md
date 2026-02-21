# Task: Implement EpicProgressRadial Component (Sub-Epic: 07_Project Dashboard Modules)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-090-1]

## 1. Initial Test Written
- [ ] Create `packages/webview-ui/src/components/dashboard/__tests__/EpicProgressRadial.test.tsx`.
- [ ] Write a unit test that renders `<EpicProgressRadial epics={[]} />` and asserts that the SVG container is present with `role="img"` and an accessible `aria-label` describing overall completion.
- [ ] Write a test that passes an array of 8 epics (each with `id`, `name`, `totalRequirements: number`, `completedRequirements: number`) and asserts that:
  - The computed overall completion percentage is rendered as text inside the radial (e.g. `"42%"`).
  - One `<circle>` element with class `progress-arc` has a `stroke-dashoffset` value proportional to the completion percentage.
- [ ] Write a test that passes 16 epics and confirms all 16 arc segments are rendered (one per epic), each with a distinct `data-epic-id` attribute.
- [ ] Write a test verifying that hovering (or focusing) on an individual arc segment emits an `onEpicFocus` callback prop with the correct epic `id`.
- [ ] Write an integration test (using `@testing-library/react`) that mounts the component wired to a mock `useEpicProgress` hook and confirms the radial updates when the hook returns new data.
- [ ] Confirm all tests **fail** before implementation.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/components/dashboard/EpicProgressRadial.tsx`.
- [ ] Define the `Epic` interface: `{ id: string; name: string; totalRequirements: number; completedRequirements: number; color?: string }`.
- [ ] Define component props: `{ epics: Epic[]; onEpicFocus?: (epicId: string) => void; className?: string }`.
- [ ] Compute overall completion as `sum(completedRequirements) / sum(totalRequirements)` clamped to `[0, 1]`.
- [ ] Render an SVG with a fixed `viewBox="0 0 200 200"`. Use a `<circle>` base track and a second `<circle>` for the animated progress arc, driven by `stroke-dasharray` and `stroke-dashoffset` computed from `circumference * (1 - completionFraction)`.
- [ ] When `epics.length > 1`, divide the circumference into arc segments proportional to each epic's `totalRequirements` weight. Render one `<path>` or `<circle>` per epic using its own `completedRequirements/totalRequirements` fill ratio. Assign each `data-epic-id={epic.id}`.
- [ ] Render the numeric completion percentage and a label (e.g., "Complete") as centered `<text>` elements.
- [ ] Attach `onMouseEnter`/`onFocus` handlers on each arc segment to call `onEpicFocus` with the segment's epic `id`.
- [ ] Create `packages/webview-ui/src/hooks/useEpicProgress.ts`. This hook subscribes to the RTES `EventBus` for `epic:progress` events and returns the current `Epic[]` array. Provide a mock implementation via a context or env flag for Storybook/test environments.
- [ ] Apply a CSS transition `stroke-dashoffset 0.6s ease-in-out` via a stylesheet or inline style to animate the arc when values change.
- [ ] Export the component from `packages/webview-ui/src/components/dashboard/index.ts`.

## 3. Code Review
- [ ] Verify that the SVG arcs are computed using pure functions (no side effects inside render) and are fully memoized with `useMemo` to prevent unnecessary recalculations on unrelated re-renders.
- [ ] Confirm there are no hard-coded pixel values outside of the `viewBox` and the radius constant; all geometry is derived from a single `RADIUS` constant.
- [ ] Verify the `onEpicFocus` callback is wrapped in `useCallback` to maintain referential stability.
- [ ] Confirm accessibility: SVG has `role="img"`, a dynamic `aria-label`, and each arc segment has `aria-label={epic.name + ' ' + pct + '% complete'}`.
- [ ] Confirm the component is a pure presentational component with no direct `EventBus` imports; data is sourced exclusively via the `useEpicProgress` hook.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=EpicProgressRadial` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern=EpicProgressRadial` and confirm line coverage ≥ 90% for `EpicProgressRadial.tsx` and `useEpicProgress.ts`.

## 5. Update Documentation
- [ ] Add a JSDoc comment block at the top of `EpicProgressRadial.tsx` describing the props interface, expected data shape, and animation behaviour.
- [ ] Update `docs/ui-components.md` (create if absent) with a section `## EpicProgressRadial` that includes: purpose, prop table, hook dependency, and a Mermaid diagram of data flow from `EventBus` → `useEpicProgress` → `EpicProgressRadial`.
- [ ] Update the agent memory file `memory/phase_12_decisions.md` with the entry: `EpicProgressRadial uses SVG stroke-dashoffset for arc animation; segmented multi-epic mode triggered when epics.length > 1`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --ci --forceExit --testPathPattern=EpicProgressRadial` and assert exit code is `0`.
- [ ] Run `pnpm --filter @devs/webview-ui build` and assert exit code is `0` (TypeScript compilation clean, no type errors in new files).
