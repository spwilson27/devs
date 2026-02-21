# Task: Decision Matrix Table Component (Sub-Epic: 10_Research and Document Review Panels)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-091-3]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/research/__tests__/DecisionMatrix.test.tsx`, write unit tests using React Testing Library and Vitest that verify:
  - The `DecisionMatrix` component renders a `<table>` with `role="table"` and a visible caption.
  - The header row contains a "Criterion" column plus one column per option (e.g., "React", "Angular").
  - Each data row displays: criterion label, weight (e.g., `0.4`), and per-option score formatted to one decimal place.
  - A "Weighted Score" summary row is rendered at the bottom with each option's total (sum of `weight × score` across all criteria), formatted to two decimal places.
  - The column with the highest weighted score has a CSS class `best-option` applied to its header `<th>` and all its `<td>` cells.
  - Sorting: clicking a column header re-sorts rows by that option's raw score descending; clicking again reverses to ascending.
  - When `options` prop is empty, a `<p data-testid="matrix-empty">No options to compare.</p>` is rendered instead of the table.
  - Snapshot test for the default render with two options and three criteria.

## 2. Task Implementation
- [ ] Define TypeScript types in `packages/webview-ui/src/types/research.ts`:
  ```ts
  export interface MatrixCriterion {
    id: string;
    label: string;
    weight: number; // 0.0 – 1.0; sum of all weights should equal 1.0
  }
  export interface MatrixOption {
    id: string;
    label: string;
    scores: Record<string, number>; // criterionId -> raw score (0.0 – 10.0)
  }
  export interface DecisionMatrixData {
    title: string;
    criteria: MatrixCriterion[];
    options: MatrixOption[];
  }
  ```
- [ ] Create `packages/webview-ui/src/components/research/DecisionMatrix.tsx`:
  - Props: `data: DecisionMatrixData`.
  - Compute `weightedTotal(option: MatrixOption): number` as `sum(criterion.weight * option.scores[criterion.id])` for all criteria.
  - Determine `bestOptionId`: the option with the maximum `weightedTotal`.
  - Maintain `sortState: { criterionId: string | null; direction: 'asc' | 'desc' }` in `useState`.
  - Derive `sortedCriteria`: copy of `data.criteria`, reordered based on `sortState` if active.
  - Render:
    ```tsx
    <div className="overflow-x-auto">
      <table role="table" className="min-w-full border-collapse text-sm">
        <caption className="text-left font-semibold mb-2">{data.title}</caption>
        <thead>
          <tr>
            <th scope="col">Criterion</th>
            <th scope="col">Weight</th>
            {data.options.map(opt => (
              <th
                key={opt.id}
                scope="col"
                onClick={() => handleSort(opt.id)}
                className={opt.id === bestOptionId ? 'best-option' : ''}
              >
                {opt.label}
                {/* sort arrow icon */}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedCriteria.map(criterion => (
            <tr key={criterion.id}>
              <td>{criterion.label}</td>
              <td>{criterion.weight.toFixed(1)}</td>
              {data.options.map(opt => (
                <td key={opt.id} className={opt.id === bestOptionId ? 'best-option' : ''}>
                  {(opt.scores[criterion.id] ?? 0).toFixed(1)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold border-t-2">
            <td colSpan={2}>Weighted Score</td>
            {data.options.map(opt => (
              <td key={opt.id} className={opt.id === bestOptionId ? 'best-option' : ''}>
                {weightedTotal(opt).toFixed(2)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
    ```
  - Implement `handleSort(optionId: string)` toggling direction if same column, resetting to `desc` on new column.
  - When `data.options.length === 0`, render `<p data-testid="matrix-empty">No options to compare.</p>`.
- [ ] Apply Tailwind: `best-option` class should map to `bg-green-50 font-semibold` via a conditional join.
- [ ] Export `DecisionMatrix` from `packages/webview-ui/src/components/research/index.ts`.
- [ ] Integrate `DecisionMatrix` into the Technology Landscape tab panel inside `ResearchPanel`, rendering it below the section list if `report.decisionMatrix` is present.

## 3. Code Review
- [ ] Verify `weightedTotal` is a pure function extracted outside the component and unit-tested independently.
- [ ] Confirm `<table>` has correct `scope` attributes on `<th>` cells for screen reader compatibility.
- [ ] Ensure sorting mutates a derived copy of `criteria`, never `data.criteria` directly (props are immutable).
- [ ] Check that the `best-option` class is applied consistently to the header and all body/footer cells in that column.
- [ ] Verify edge case: if two options tie for best weighted total, both columns receive `best-option` class.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter webview-ui test -- --run DecisionMatrix` and confirm all tests pass.
- [ ] Run coverage and confirm `DecisionMatrix.tsx` has ≥ 90% branch coverage (especially the tie-handling and empty-state branches).

## 5. Update Documentation
- [ ] Add JSDoc to `DecisionMatrix.tsx` documenting the scoring formula and `bestOptionId` tie-breaking rule.
- [ ] Document the `MatrixCriterion`, `MatrixOption`, and `DecisionMatrixData` interfaces in `packages/webview-ui/src/types/research.ts` with inline comments.
- [ ] Add to `docs/agent-memory/phase_12_decisions.md`: "DecisionMatrix uses weighted scoring (`weight × raw score`); the best-option column is highlighted green; ties highlight all tied columns."

## 6. Automated Verification
- [ ] `pnpm --filter webview-ui test -- --run` exits 0.
- [ ] `pnpm --filter webview-ui tsc --noEmit` exits 0.
- [ ] Run `pnpm --filter webview-ui test -- --run --coverage --reporter=json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); cov=d['coverageMap']; files=[k for k in cov if 'DecisionMatrix' in k]; assert all(cov[f]['s'] and sum(cov[f]['s'].values())/len(cov[f]['s'])>=0.9 for f in files), 'Coverage < 90%'; print('Coverage OK')"` exits successfully.
