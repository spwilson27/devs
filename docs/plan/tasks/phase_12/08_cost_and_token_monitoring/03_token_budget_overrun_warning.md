# Task: Implement Token Budget Overrun Warning Overlay (Sub-Epic: 08_Cost and Token Monitoring)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-123]

## 1. Initial Test Written
- [ ] In `packages/core/src/cost/__tests__/BudgetGuard.test.ts`, write unit tests for a `BudgetGuard` class:
  - Constructor accepts `{ budgetUsd: number }`.
  - `checkBudget(currentSpendUsd: number): BudgetStatus` returns `{ ratio: number, exceeded80Percent: boolean, exceeded100Percent: boolean }`.
  - At exactly 80% spend, `exceeded80Percent` is `true`.
  - Below 80%, both flags are `false`.
  - At 100%+, both flags are `true`.
  - `ratio` is `currentSpendUsd / budgetUsd` (a float, e.g., `0.85`).
  - `budgetUsd` of `0` throws `InvalidBudgetError`.
- [ ] In `packages/webview-ui/src/components/cost/__tests__/BudgetOverrunOverlay.test.tsx`, write React Testing Library tests for a `<BudgetOverrunOverlay>` component:
  - When `exceeded80Percent` is `false`, the overlay is NOT rendered (component returns `null`).
  - When `exceeded80Percent` is `true` and `exceeded100Percent` is `false`, a yellow semi-transparent overlay `div` is rendered with `data-testid="budget-overrun-overlay"` and contains the warning text `"Budget Warning: >80% spent"`.
  - When both flags are `true`, the overlay renders with `data-testid="budget-critical-overlay"` and text `"Budget Exceeded: 100%+ spent"`.
  - The overlay renders as a sibling wrapper around or positioned above the "Run" button — confirm via `aria-describedby` or role assertion.
- [ ] In `packages/webview-ui/src/hooks/__tests__/useBudgetStatus.test.ts`, write hook tests for `useBudgetStatus(epicId: string)`:
  - Subscribes to `cost:updated` events for the given `epicId`.
  - Calls `BudgetGuard.checkBudget` on each update and returns current `BudgetStatus`.
  - Budget is sourced from VSCode workspace configuration `devs.budget.usd` (mock with a config provider stub).
  - Returns `{ budgetStatus: BudgetStatus | null, isLoading: boolean }`.

## 2. Task Implementation
- [ ] Create `packages/core/src/cost/BudgetGuard.ts`:
  ```ts
  export class InvalidBudgetError extends Error {}
  export interface BudgetStatus { ratio: number; exceeded80Percent: boolean; exceeded100Percent: boolean; }
  export class BudgetGuard {
    constructor(private readonly budgetUsd: number) {
      if (budgetUsd <= 0) throw new InvalidBudgetError('budgetUsd must be > 0');
    }
    checkBudget(currentSpendUsd: number): BudgetStatus {
      const ratio = currentSpendUsd / this.budgetUsd;
      return { ratio, exceeded80Percent: ratio >= 0.8, exceeded100Percent: ratio >= 1.0 };
    }
  }
  ```
- [ ] Export `BudgetGuard`, `BudgetStatus`, and `InvalidBudgetError` from `packages/core/src/cost/index.ts`.
- [ ] Create `packages/webview-ui/src/hooks/useBudgetStatus.ts`:
  - Reads `devs.budget.usd` from VSCode workspace config via the `postMessage` bridge (request/response pattern: send `{ type: 'config:get', key: 'devs.budget.usd' }`, await `{ type: 'config:value', key: 'devs.budget.usd', value: number }`).
  - Instantiates `BudgetGuard` once budget is resolved.
  - Subscribes to `cost:updated` events for the given `epicId`.
  - On each event, calls `budgetGuard.checkBudget(epicSnapshot.estimatedUsdCost)` and updates `budgetStatus` state.
- [ ] Create `packages/webview-ui/src/components/cost/BudgetOverrunOverlay.tsx`:
  - Props: `budgetStatus: BudgetStatus | null; children: React.ReactNode`.
  - Renders `children` always; when `exceeded80Percent`, also renders an absolutely-positioned `<div>` overlay styled with:
    - `background: rgba(255, 204, 0, 0.15)` (yellow, 15% opacity) when warning.
    - `background: rgba(255, 60, 0, 0.2)` (red-orange, 20% opacity) when critical (100%+).
    - `pointer-events: none` so the underlying button remains clickable.
    - A `<span>` with appropriate warning text centered in the overlay.
  - Uses CSS-in-JS via the project's existing `styled-components` or `emotion` setup (match whichever is already used in the project).
- [ ] Wrap the "Run" button in the main `<AgentControlBar>` component (`packages/webview-ui/src/components/controls/AgentControlBar.tsx`) with `<BudgetOverrunOverlay budgetStatus={budgetStatus}>`:
  - Import `useBudgetStatus` with the current `epicId` from context.
  - Pass `budgetStatus` to the overlay.

## 3. Code Review
- [ ] Confirm `BudgetGuard` has zero UI or side-effect code — it is a pure computation class.
- [ ] Verify `BudgetOverrunOverlay` uses `pointer-events: none` on the overlay div so it does not block click events on the "Run" button beneath.
- [ ] Confirm color values (`rgba(255,204,0,0.15)` for warning; `rgba(255,60,0,0.2)` for critical) match the design spec in `specs/7_ui_ux_design.md` (cross-check the hex values).
- [ ] Ensure `useBudgetStatus` handles the case where `devs.budget.usd` is not configured (return `budgetStatus: null` and set `isLoading: false`), so the overlay never renders when no budget is set.
- [ ] Verify `InvalidBudgetError` is properly exported and tested.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=BudgetGuard` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="BudgetOverrunOverlay|useBudgetStatus"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui build` to confirm no TypeScript or bundler errors.

## 5. Update Documentation
- [ ] Create `packages/core/src/cost/BudgetGuard.agent.md` with: purpose, constructor contract, `checkBudget` semantics, threshold definitions (80% / 100%), and example usage.
- [ ] Create `packages/webview-ui/src/components/cost/BudgetOverrunOverlay.agent.md` with: visual behavior description, color tokens used, pointer-events rationale, and the "no budget configured" fallback behavior.
- [ ] Update `packages/webview-ui/src/hooks/useBudgetStatus.agent.md` (create if not present) describing the config request/response protocol over the postMessage bridge.
- [ ] Add a note to `docs/user-guide/cost-management.md` (create the file if it does not exist) explaining: how to set `devs.budget.usd` in VSCode settings, what the yellow overlay means, and how to increase the budget.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern=BudgetGuard` and confirm 100% statement coverage for `BudgetGuard.ts`.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="BudgetOverrunOverlay|useBudgetStatus"` and confirm ≥ 90% coverage.
- [ ] Run `grep -r "pointer-events: none" packages/webview-ui/src/components/cost/BudgetOverrunOverlay.tsx` and confirm the style is present.
- [ ] Run `grep -r "rgba(255, 204, 0" packages/webview-ui/src/components/cost/BudgetOverrunOverlay.tsx` and confirm the warning color is present.
