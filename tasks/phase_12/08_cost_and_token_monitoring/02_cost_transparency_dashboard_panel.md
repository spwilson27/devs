# Task: Implement Cost Transparency Dashboard Panel (Sub-Epic: 08_Cost and Token Monitoring)

## Covered Requirements
- [4_USER_FEATURES-REQ-085]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/cost/__tests__/CostPanel.test.tsx`, write React Testing Library unit tests for a `<CostPanel>` component:
  - Renders a "Current Task Cost" section showing `estimatedUsdCost` formatted as `$0.0000` (4 decimal places).
  - Renders an "Epic Spend" section showing the cumulative epic cost.
  - When `CostSnapshot.estimatedUsdCost` is `0`, displays `$0.0000` (not `NaN` or blank).
  - Updates displayed values when new `CostSnapshot` props are passed (prop-driven re-render).
  - Snapshot test to lock visual structure.
- [ ] In `packages/webview-ui/src/hooks/__tests__/useCostStream.test.ts`, write tests for a `useCostStream(taskId: string, epicId: string)` React hook:
  - Subscribes to `cost:updated` WebSocket/postMessage events on mount.
  - Returns `{ taskSnapshot: CostSnapshot, epicSnapshot: CostSnapshot, isLoading: boolean }`.
  - Updates `taskSnapshot` when a `cost:updated` event with matching `taskId` arrives.
  - Updates `epicSnapshot` when a `cost:updated` event with matching `epicId` arrives.
  - Unsubscribes from events on unmount (no memory leaks).
  - Uses `@testing-library/react` `renderHook` with a mocked `postMessage` bridge.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/components/cost/CostPanel.tsx`:
  - Props: `taskSnapshot: CostSnapshot; epicSnapshot: CostSnapshot; className?: string`.
  - Renders two labeled metric rows using the project's existing `<MetricRow>` primitive (or create one if absent): label + value with monospace font for the USD amount.
  - Use `Intl.NumberFormat` with `minimumFractionDigits: 4, maximumFractionDigits: 4` for cost formatting.
  - Token counts (`inputTokens`, `outputTokens`) are shown as secondary detail beneath each cost figure in muted text.
  - No internal state — purely presentational, driven by props.
- [ ] Create `packages/webview-ui/src/hooks/useCostStream.ts`:
  - Listens on the VSCode webview `window.addEventListener('message', ...)` bridge for `{ type: 'cost:updated', payload: { taskId, epicId, snapshot } }` messages.
  - Maintains two `useState` entries: `taskSnapshot` and `epicSnapshot`.
  - On receive: if `payload.taskId === taskId`, update `taskSnapshot`; if `payload.epicId === epicId`, update `epicSnapshot`.
  - Initial `isLoading: true` flips to `false` after the first message for either ID arrives (or after 5 s timeout — display `--` if no data).
- [ ] Wire `<CostPanel>` into the existing `<HealthTelemetry>` parent panel in `packages/webview-ui/src/panels/HealthTelemetry.tsx`:
  - Import `useCostStream` and pass its return values as props to `<CostPanel>`.
  - Place `<CostPanel>` below the existing CPU/MEM resource gauges.
- [ ] In `packages/extension/src/panels/HealthTelemetryProvider.ts`, ensure the extension host relays `cost:updated` events from the `EventBus` to the active webview panel via `webviewPanel.webview.postMessage`.

## 3. Code Review
- [ ] Confirm `<CostPanel>` is a pure functional component with no side effects — all data comes via props from `useCostStream`.
- [ ] Verify `useCostStream` cleanup function removes the message event listener (`removeEventListener`) to prevent leaks.
- [ ] Check that the USD formatting logic is extracted into a pure utility function `formatUsd(amount: number): string` in `packages/webview-ui/src/utils/format.ts` so it can be reused.
- [ ] Ensure the extension host bridge in `HealthTelemetryProvider.ts` filters events to only post `cost:updated` to the correct webview (scoped by active session).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=cost` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=useCostStream` and confirm hook tests pass with zero memory-leak warnings.
- [ ] Run `pnpm --filter @devs/extension build` to confirm TypeScript compilation succeeds with the new relay logic.

## 5. Update Documentation
- [ ] Create `packages/webview-ui/src/components/cost/CostPanel.agent.md` with: component purpose, props interface, rendering contract, and screenshot description (ASCII art is acceptable).
- [ ] Create `packages/webview-ui/src/hooks/useCostStream.agent.md` with: hook purpose, parameters, return shape, event protocol expected from extension host, and timeout behavior.
- [ ] Update `packages/webview-ui/README.md` to mention `<CostPanel>` under the "Dashboard Panels" section.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="cost|useCostStream"` and confirm coverage ≥ 90% for the new files.
- [ ] Run `grep -r "removeEventListener" packages/webview-ui/src/hooks/useCostStream.ts` and confirm cleanup is present.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm the bundle includes `CostPanel` (verify with `grep -r "CostPanel" packages/webview-ui/dist/`).
