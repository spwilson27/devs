# Task: Risk Indicator Badges for Downstream Task Impact (Sub-Epic: 83_Transactional_Signoff_Diff)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-101], [7_UI_UX_DESIGN-REQ-UI-DES-101-2]

## 1. Initial Test Written
- [ ] In `packages/webview/src/utils/__tests__/computeRiskLevel.test.ts`, write unit tests for `computeRiskLevel(affectedTaskCount: number): 'low' | 'medium' | 'high'`:
  - `affectedTaskCount <= 3` → `'low'`
  - `affectedTaskCount >= 4 && affectedTaskCount <= 10` → `'medium'`
  - `affectedTaskCount > 10` → `'high'`
  - Boundary: `0` → `'low'`, `3` → `'low'`, `4` → `'medium'`, `10` → `'medium'`, `11` → `'high'`.

- [ ] In `packages/webview/src/components/modals/__tests__/RiskIndicatorBadge.test.tsx`, write tests:
  - **Low risk render**: Given `affectedTaskCount=2`, assert badge renders text "Low" and carries CSS class `risk-badge--low`.
  - **Medium risk render**: Given `affectedTaskCount=7`, assert badge renders text "Medium" and carries class `risk-badge--medium`.
  - **High risk render**: Given `affectedTaskCount=15`, assert badge renders text "High" and carries class `risk-badge--high`.
  - **Affected task count display test**: Assert a `<span data-testid="risk-badge-count">` renders the string `"{affectedTaskCount} tasks affected"` for each tier.
  - **Accessible label test**: Assert the badge element has `aria-label` of the form `"Risk level: High — 15 tasks affected"`.
  - **Zero tasks test**: `affectedTaskCount=0` → badge renders "Low" and displays "0 tasks affected".
  - Use `@testing-library/react` + `jest`.

## 2. Task Implementation
- [ ] Create `packages/webview/src/utils/computeRiskLevel.ts`:
  ```ts
  export type RiskLevel = 'low' | 'medium' | 'high';
  export function computeRiskLevel(affectedTaskCount: number): RiskLevel {
    if (affectedTaskCount <= 3) return 'low';
    if (affectedTaskCount <= 10) return 'medium';
    return 'high';
  }
  ```
- [ ] Create `packages/webview/src/components/modals/RiskIndicatorBadge.tsx`:
  - Props:
    ```ts
    interface RiskIndicatorBadgeProps {
      affectedTaskCount: number;
    }
    ```
  - Call `computeRiskLevel(affectedTaskCount)` to derive `level`.
  - Render:
    ```tsx
    <span
      className={`risk-badge risk-badge--${level}`}
      aria-label={`Risk level: ${labelMap[level]} — ${affectedTaskCount} tasks affected`}
    >
      <span className="risk-badge__label">{labelMap[level]}</span>
      <span data-testid="risk-badge-count" className="risk-badge__count">
        {affectedTaskCount} tasks affected
      </span>
    </span>
    ```
  - `labelMap`: `{ low: 'Low', medium: 'Medium', high: 'High' }`.
  - Define CSS classes in `RiskIndicatorBadge.css` (co-located):
    - `.risk-badge`: `display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;` (11px = Metadata type-scale per `[7_UI_UX_DESIGN-REQ-UI-DES-033-6]`).
    - `.risk-badge--low`: `background: color-mix(in srgb, var(--vscode-testing-iconPassed) 20%, transparent); color: var(--vscode-testing-iconPassed);`
    - `.risk-badge--medium`: `background: color-mix(in srgb, var(--vscode-editorWarning-foreground) 20%, transparent); color: var(--vscode-editorWarning-foreground);`
    - `.risk-badge--high`: `background: color-mix(in srgb, var(--vscode-editorError-foreground) 20%, transparent); color: var(--vscode-editorError-foreground);`
  - Import `./RiskIndicatorBadge.css` inside the component.
- [ ] Render `<RiskIndicatorBadge affectedTaskCount={proposal.affectedTaskCount} />` in the `TransactionalSignoffModal` header (beside the document title).
- [ ] Export `RiskIndicatorBadge` from `packages/webview/src/components/modals/index.ts`.

## 3. Code Review
- [ ] Confirm `computeRiskLevel` is a pure function with no side effects.
- [ ] Verify **no hardcoded colors** — all color values use `color-mix()` with `var(--vscode-*)` tokens.
- [ ] Confirm `aria-label` is a human-readable string summarising both level and count (screen-reader friendly).
- [ ] Verify badge font-size is `11px` matching the Metadata type-scale `[7_UI_UX_DESIGN-REQ-UI-DES-033-6]`.
- [ ] Confirm border-radius is `4px` per `[7_UI_UX_DESIGN-REQ-UI-DES-047-1]`.
- [ ] Confirm the CSS uses `color-mix()` consistent with `[7_UI_UX_DESIGN-REQ-UI-DES-011]`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern="RiskIndicatorBadge|computeRiskLevel"` and confirm all tests pass with zero failures.

## 5. Update Documentation
- [ ] Create `packages/webview/src/components/modals/RiskIndicatorBadge.agent.md` documenting:
  - Purpose: surface risk of approving a TAS change based on downstream task blast radius.
  - Tier thresholds (`low ≤ 3`, `medium 4–10`, `high > 10`) and rationale.
  - Color token mapping per tier.
  - Props contract.
- [ ] Add a JSDoc comment to `computeRiskLevel.ts` with the tier thresholds.
- [ ] Update `packages/webview/src/components/modals/TransactionalSignoffModal.agent.md` to note the `RiskIndicatorBadge` integration point.

## 6. Automated Verification
- [ ] CI step `pnpm --filter @devs/webview test --ci --coverage` must exit 0.
- [ ] Assert coverage for `RiskIndicatorBadge.tsx` and `computeRiskLevel.ts` is ≥ 90% (lines).
- [ ] Run `pnpm --filter @devs/webview lint` and confirm zero ESLint errors in new files.
