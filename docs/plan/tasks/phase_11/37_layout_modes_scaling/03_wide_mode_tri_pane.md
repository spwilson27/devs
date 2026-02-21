# Task: Implement Wide Mode Tri-pane Layout and Controls (Sub-Epic: 37_Layout_Modes_Scaling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-062-3]

## 1. Initial Test Written
- [ ] Add unit and integration tests at `packages/ui/src/__tests__/LayoutContainer.wide.spec.tsx`:
  - Unit: Mount `LayoutContainer` with mode = 'wide' and assert `gridTemplateColumns === '20% 60% 20%'` (or that panePercentages numeric array equals `[20,60,20]`).
  - Assert the center pane percentage is >= 50% of total using numeric assertions.
  - Integration: Simulate dragging the left-center and center-right splitters and assert the sum of percentages equals 100 and the center pane remains dominant.
  - Accessibility: Assert two splitters have roles, keyboard control, and that collapse/expand buttons for side panels have aria-pressed and correct labels.

## 2. Task Implementation
- [ ] Implement tri-pane support in `LayoutContainer` and `LayoutProvider`:
  - Extend `getLayoutConfiguration` to support a three-value return for 'wide' mode: `panePercentages: [left, center, right]` and `columns` string `"20% 60% 20%"`.
  - Render three panes and two splitters. Each splitter must be independent but constrained so `left + center + right === 100` and `MID_MIN = 40` to guarantee center dominance.
  - Implement collapse button on each side that toggles the pane to `0%` (ghost rail) and stores the collapsed state to the layout slice.
  - Use CSS variables and inline `gridTemplateColumns` for animation; avoid layout thrashing by updating only state used for CSS variables.
  - Persist collapsed state and split positions to localStorage / vscode state.

## 3. Code Review
- [ ] Verify:
  - Correct math for splitter interactions (percentages sum to 100) and robust edge-case tests (rapid alternating drags, collapse while dragging).
  - Separation of concerns: layout calculation in pure functions; DOM effects minimal and guarded.
  - Accessibility: keyboard interactions, ARIA attributes, and focus management reviewed.

## 4. Run Automated Tests to Verify
- [ ] Run unit/integration tests and Playwright scenarios to ensure:
  - Tri-pane renders, splitters function and collapse/expand work.
  - Persisted settings are restored on reload.

## 5. Update Documentation
- [ ] Update `docs/ui/layout-modes.md` with tri-pane diagrams, collapse/expand behavior, recommended minimum center percentage, and performance considerations.

## 6. Automated Verification
- [ ] Playwright test `tests/e2e/wide_mode_spec.ts` should load the harness, confirm center pane >= 50% by DOM measurement, simulate splitter drags, and assert persisted values are restored after reload.