# Task: Implement Real-time Resource Gauges UI Component (Sub-Epic: 09_System Health and Performance Profiling)

## Covered Requirements
- [4_USER_FEATURES-REQ-069]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/health/__tests__/ResourceGauges.test.tsx`, write React Testing Library tests:
  - Render `<ResourceGauges />` with a mock RTES event context; assert the component renders three gauge sections: "CPU", "Memory", and "Tokens".
  - Assert that each gauge displays the label and a numeric value (e.g., `"45%"` for CPU).
  - Simulate a `system.health.metrics` event arriving on the event bus (update the mock context) with `cpu.usagePercent: 72`; assert the CPU gauge updates to display `"72%"` without a full component remount.
  - Assert that when CPU usage exceeds 85%, the gauge arc/fill color transitions to `var(--vscode-charts-red)` (use `getComputedStyle` or a `data-severity` attribute check).
  - Assert that when memory usage exceeds 90%, the Memory gauge similarly shows the warning color.
  - Assert that when token `activeSessionUsed / activeSessionBudget` exceeds 80%, the Token gauge shows the warning color.
  - Assert the component renders a "—" or skeleton state when no data has been received yet (initial mount).
  - Assert the component does NOT re-render unnecessarily when an unrelated event arrives on the bus (use `render` spy / `React.memo` verification).
  - Write a snapshot test for the stable (connected, within-threshold) state.

## 2. Task Implementation

- [ ] Create `packages/webview-ui/src/components/health/ResourceGauges.tsx`:
  - Subscribe to `system.health.metrics` events from the webview-side RTES event consumer (React context or Zustand slice).
  - Maintain local state: `metrics: SystemHealthMetrics | null`.
  - Render three `<GaugeArc>` sub-components (or equivalent SVG-based arcs):
    - **CPU Gauge**: label "CPU", value `metrics.cpu.usagePercent`, unit `"%"`, warn threshold 85.
    - **Memory Gauge**: label "Memory", value `metrics.memory.usagePercent`, unit `"%"`, warn threshold 90.
    - **Tokens Gauge**: label "Tokens", computed value `Math.round((metrics.tokens.activeSessionUsed / metrics.tokens.activeSessionBudget) * 100)`, unit `"%"`, warn threshold 80.
  - Apply `data-severity="warn"` attribute when a gauge exceeds its threshold (for testability and CSS targeting).
  - Use CSS custom properties (`--vscode-charts-*`) for colors to respect the active VSCode theme.
  - Wrap the component in `React.memo` to prevent unnecessary re-renders.
  - When `metrics === null`, render a loading skeleton (three placeholder arcs with `aria-label="Loading health metrics"`).
- [ ] Create `packages/webview-ui/src/components/health/GaugeArc.tsx`:
  - Accept props: `label: string`, `value: number`, `unit: string`, `warnThreshold: number`, `maxValue?: number` (default 100).
  - Render an SVG circular arc with a stroke-dasharray technique; animate value changes using CSS `transition: stroke-dashoffset 400ms ease-out`.
  - Apply `data-severity="warn"` and color change when `value >= warnThreshold`.
- [ ] Export `ResourceGauges` from `packages/webview-ui/src/components/health/index.ts`.
- [ ] Register `ResourceGauges` in the `HealthTelemetry` panel layout (import and place it in the designated dashboard slot).

## 3. Code Review

- [ ] Confirm no business logic exists in `ResourceGauges`; it only reads from the event bus and renders.
- [ ] Confirm SVG animations use CSS transitions (not JS `setInterval` redraws) to maintain 60FPS.
- [ ] Confirm `React.memo` wraps the component and the dependency array of any `useEffect` subscribing to the event bus is correct (no stale closure captures).
- [ ] Confirm all color references use VSCode CSS variables, not hardcoded hex values.
- [ ] Confirm `aria-label` attributes are present on each gauge for accessibility.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="ResourceGauges"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="ResourceGauges"` and confirm line/branch coverage ≥ 85%.

## 5. Update Documentation

- [ ] Add a JSDoc/TSDoc comment to `ResourceGauges` and `GaugeArc` describing props and threshold behavior.
- [ ] Update `packages/webview-ui/README.md` to list `ResourceGauges` in the "Health & Telemetry" component catalogue.
- [ ] Update `docs/agent_memory/phase_12_decisions.md`: "`ResourceGauges` is a React.memo component; it subscribes to `system.health.metrics` events. Warn thresholds: CPU 85%, Memory 90%, Tokens 80%. SVG arcs use CSS transitions for 60FPS animation."

## 6. Automated Verification

- [ ] CI runs `pnpm --filter @devs/webview-ui test -- --ci --testPathPattern="ResourceGauges"` and exits code 0.
- [ ] Snapshot artifact `ResourceGauges.test.tsx.snap` is committed and matches the rendered output.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm zero TypeScript/JSX compilation errors.
