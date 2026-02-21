# Task: Implement HealthTelemetry Gauges Component (Sub-Epic: 07_Project Dashboard Modules)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-090-3]

## 1. Initial Test Written
- [ ] Create `packages/webview-ui/src/components/dashboard/__tests__/HealthTelemetry.test.tsx`.
- [ ] Define a `HealthMetrics` fixture type: `{ tokenSpendUsd: number; codeCoveragePct: number; testPassRatePct: number }`.
- [ ] Write a unit test rendering `<HealthTelemetry metrics={{ tokenSpendUsd: 0, codeCoveragePct: 0, testPassRatePct: 0 }} />` and asserting three gauge elements are present, each identifiable by `data-gauge` attributes: `"token-spend"`, `"code-coverage"`, and `"test-pass-rate"`.
- [ ] Write a test passing `{ tokenSpendUsd: 12.50, codeCoveragePct: 87.3, testPassRatePct: 94.1 }` and asserting each gauge displays the correctly formatted value:
  - Token Spend: `"$12.50"`.
  - Code Coverage: `"87.3%"`.
  - Test Pass Rate: `"94.1%"`.
- [ ] Write a test confirming that `codeCoveragePct < 60` causes the gauge to render with class `gauge--danger`, `60 ≤ value < 80` renders `gauge--warning`, and `value ≥ 80` renders `gauge--healthy`.
- [ ] Write a test confirming the same threshold-based class logic applies to `testPassRatePct`.
- [ ] Write a test that simulates the mock `useHealthTelemetry` hook emitting a new `HealthMetrics` object and confirms the displayed values update without a full re-mount.
- [ ] Write an accessibility test confirming each gauge has `role="meter"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax` (100 for percentages, unbounded for USD), and a descriptive `aria-label`.
- [ ] Confirm all tests **fail** before implementation.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/components/dashboard/HealthTelemetry.tsx`.
- [ ] Define the `HealthMetrics` interface: `{ tokenSpendUsd: number; codeCoveragePct: number; testPassRatePct: number }`.
- [ ] Define component props: `{ metrics: HealthMetrics; className?: string }`.
- [ ] Create a generic `<Gauge>` sub-component (in the same file or a sibling file `Gauge.tsx`) with props:
  - `id: string` (used for `data-gauge`).
  - `label: string`.
  - `value: number`.
  - `formattedValue: string`.
  - `thresholds?: { warning: number; danger: number }` (defaults: `{ warning: 80, danger: 60 }`; for token spend, omit thresholds).
  - `ariaMax?: number`.
- [ ] `Gauge` renders an SVG arc (semi-circle, 180°) where the filled arc length is `value / ariaMax * π * r`. Apply `stroke-dashoffset` animation with `transition: stroke-dashoffset 0.5s ease-out`.
- [ ] `Gauge` applies `gauge--healthy`, `gauge--warning`, or `gauge--danger` CSS class on the arc stroke based on `thresholds` and current `value`.
- [ ] `Gauge` renders `<g role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={ariaMax ?? 100} data-gauge={id}>`.
- [ ] `HealthTelemetry` renders the three `<Gauge>` instances inside a `<section aria-label="Health Telemetry">`:
  - Token Spend: `id="token-spend"`, `label="Token Spend"`, `formattedValue={"$" + tokenSpendUsd.toFixed(2)}`, no thresholds.
  - Code Coverage: `id="code-coverage"`, `label="Code Coverage"`, `formattedValue={codeCoveragePct.toFixed(1) + "%"}`, thresholds `{ warning: 80, danger: 60 }`.
  - Test Pass Rate: `id="test-pass-rate"`, `label="Test Pass Rate"`, `formattedValue={testPassRatePct.toFixed(1) + "%"}`, thresholds `{ warning: 80, danger: 60 }`.
- [ ] Create `packages/webview-ui/src/hooks/useHealthTelemetry.ts`. This hook subscribes to `health:metrics` events on the RTES `EventBus` and returns the latest `HealthMetrics` object. Initialize with `{ tokenSpendUsd: 0, codeCoveragePct: 0, testPassRatePct: 0 }` as defaults.
- [ ] Export `HealthTelemetry` and `Gauge` from `packages/webview-ui/src/components/dashboard/index.ts`.

## 3. Code Review
- [ ] Verify `Gauge` is a memoized component (`React.memo`) so that unchanged gauges do not re-render when only one metric changes.
- [ ] Confirm the threshold-to-class mapping is implemented as a pure function `resolveGaugeStatus(value: number, thresholds?: { warning: number; danger: number }): 'healthy' | 'warning' | 'danger'` exported from a shared `utils/gauge.ts` and unit tested independently.
- [ ] Verify the SVG arc computation handles edge cases: `value = 0` (empty arc), `value = ariaMax` (full arc), `value > ariaMax` (clamped to full arc).
- [ ] Confirm `useHealthTelemetry` cleans up the `EventBus` subscription in its `useEffect` cleanup to prevent stale listener accumulation.
- [ ] Verify no inline styles override CSS custom properties; all colors (healthy/warning/danger) are defined as CSS variables in the design token stylesheet.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=HealthTelemetry` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=gauge` to confirm `resolveGaugeStatus` utility tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="HealthTelemetry|gauge"` and confirm line coverage ≥ 90%.

## 5. Update Documentation
- [ ] Add JSDoc blocks to `HealthTelemetry.tsx`, `Gauge.tsx`, and `useHealthTelemetry.ts` documenting the `HealthMetrics` type, threshold semantics, and ARIA implementation.
- [ ] Add a `## HealthTelemetry` section to `docs/ui-components.md` with: purpose, `HealthMetrics` prop table, threshold colour matrix (table: value range vs CSS class vs colour), and a Mermaid data-flow diagram.
- [ ] Update `memory/phase_12_decisions.md`: `HealthTelemetry uses SVG semi-circle arc gauges; threshold classes healthy/warning/danger driven by resolveGaugeStatus pure function; token spend gauge has no thresholds`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --ci --forceExit --testPathPattern="HealthTelemetry|gauge"` and assert exit code is `0`.
- [ ] Run `pnpm --filter @devs/webview-ui build` and assert exit code is `0`.
